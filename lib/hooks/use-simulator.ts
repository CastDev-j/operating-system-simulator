"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  Process,
  MemoryFrame,
  FATEntry,
  FileEntry,
} from "@/lib/types/simulator";
import {
  createProcess,
  terminateProcess,
  executeProcess,
  setReadyProcess,
  resetProcessCounter,
} from "@/lib/modules/process-manager";
import {
  allocateMemory,
  deallocateMemory,
  getMemoryState,
  canAllocateMemory,
  getMemoryStats,
} from "@/lib/modules/memory-manager";
import {
  addToFifo,
  removeFromFifo,
  getFirstInQueue,
  getFifoState,
  resetFifo,
} from "@/lib/modules/fifo-manager";
import {
  createFile,
  deleteFile,
  getFATState,
  canCreateFile,
  getFATStats,
  resetFileCounter,
  resetFAT,
  isFATFull,
} from "@/lib/modules/fat-manager";
import { toast } from "@/hooks/use-toast";

export function useSimulator() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<Process[]>([]);
  const [memory, setMemory] = useState<MemoryFrame[]>(getMemoryState());
  const [fifo, setFifo] = useState<Process[]>(getFifoState());
  const [fat, setFat] = useState<FATEntry[]>(getFATState());
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecuting, setCurrentExecuting] = useState<Process | null>(
    null
  );
  const [speed, setSpeed] = useState(1000); // velocidad en ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const addProcess = useCallback(() => {
    const process = createProcess();

    if (canAllocateMemory(process)) {
      const { frames, success } = allocateMemory(process);
      if (success) {
        setMemory(frames);
        const queue = addToFifo(process);
        setFifo(queue);
        setProcesses((prev) => [...prev, process]);
      }
    } else {
      setWaitingQueue((prev) => [...prev, process]);
    }
  }, []);

  const executeNextProcess = useCallback(() => {
    const nextProcess = getFirstInQueue();

    if (!nextProcess) return;

    if (currentExecuting?.id === nextProcess.id) {
      // Usar el proceso que está en ejecución (con tiempo actualizado)
      const executed = executeProcess(currentExecuting);

      setProcesses((prev) =>
        prev.map((p) => (p.id === executed.id ? executed : p))
      );
      setFifo((prev) => prev.map((p) => (p.id === executed.id ? executed : p)));

      if (executed.timeRemaining <= 0) {
        const terminated = terminateProcess(executed);
        const frames = deallocateMemory(terminated);
        const queue = removeFromFifo();

        if (canCreateFile()) {
          const file = createFile(terminated.id, terminated.size);
          if (file) {
            setFiles((prev) => [...prev, file]);
            setFat(getFATState());
          }
        } else {
          toast({
            title: "FAT llena",
            description:
              "No se puede crear un nuevo archivo. Espacio FAT agotado.",
            variant: "destructive",
          });
        }

        setProcesses((prev) => prev.filter((p) => p.id !== terminated.id));
        setMemory(frames);
        setFifo(queue);
        setCurrentExecuting(null);

        const waitingProcess = waitingQueue[0];
        if (waitingProcess && canAllocateMemory(waitingProcess)) {
          const { frames: newFrames, success } = allocateMemory(waitingProcess);
          if (success) {
            setMemory(newFrames);
            const newQueue = addToFifo(waitingProcess);
            setFifo(newQueue);
            setProcesses((prev) => [...prev, waitingProcess]);
            setWaitingQueue((prev) => prev.slice(1));
          }
        }
      } else {
        // Actualizar currentExecuting con el tiempo decrementado
        setCurrentExecuting(executed);
      }
    } else {
      const executing = executeProcess(nextProcess);
      setCurrentExecuting(executing);
      setProcesses((prev) =>
        prev.map((p) => (p.id === executing.id ? executing : p))
      );
      setFifo((prev) =>
        prev.map((p) => (p.id === executing.id ? executing : p))
      );
    }
  }, [currentExecuting, waitingQueue]);

  const removeFile = useCallback((file: FileEntry) => {
    deleteFile(file);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    setFat(getFATState());
  }, []);

  const clearSimulator = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    processes.forEach(deallocateMemory);

    setProcesses([]);
    setWaitingQueue([]);
    setCurrentExecuting(null);
    setMemory(getMemoryState());
    resetFifo();
    setFifo([]);
    resetFAT();
    setFat(getFATState());
    setFiles([]);
    resetProcessCounter();
    resetFileCounter();
  }, [processes]);

  const downloadState = useCallback(() => {
    const memStats = getMemoryStats();
    const fatStats = getFATStats();

    const state = {
      procesos: processes.map((p) => ({
        id: p.id,
        estado: p.state,
        tiempoRestante: p.timeRemaining,
        tamaño: p.size,
        prioridad: p.priority,
        paginas: p.pages.length,
      })),
      estadisticas: {
        procesosActivos: processes.length,
        procesosEnEspera: waitingQueue.length,
        procesoActual: currentExecuting?.id || "ninguno",
        memoria: memStats,
        fat: fatStats,
        archivos: files.length,
      },
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `simulador-estado-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processes, waitingQueue, currentExecuting, files]);

  const downloadFile = useCallback((file: FileEntry) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadFat = useCallback(() => {
    const fatStats = getFATStats();
    const fatData = {
      clusters: fat.map((f) => ({
        cluster: f.cluster,
        estado:
          f.cluster === 0
            ? "HEADER"
            : f.free
            ? "LIBRE"
            : f.next === -1
            ? "EOF"
            : `NEXT:${f.next}`,
        procesoId: f.processId,
      })),
      estadisticas: fatStats,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fatData, null, 2)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sistema-fat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fat]);

  const toggleSimulator = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const changeSpeed = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  // Efecto de inicialización única
  useEffect(() => {
    resetFAT();
    setFat(getFATState());
  }, []);

  useEffect(() => {
    if (isRunning) {
      // Agregar proceso automáticamente al inicio si no hay procesos y el FAT no está lleno
      if (processes.length === 0 && waitingQueue.length === 0 && !isFATFull()) {
        addProcess();
      }

      intervalRef.current = setInterval(() => {
        executeNextProcess();

        // Agregar nuevo proceso aleatoriamente (30% de probabilidad cada tick)
        // Solo si el FAT no está lleno y no hay demasiados procesos
        if (
          Math.random() < 0.3 &&
          processes.length + waitingQueue.length < 10 &&
          !isFATFull()
        ) {
          addProcess();
        }
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      setProcesses((prev) =>
        prev.map((p) => (p.state === "ejecutando" ? setReadyProcess(p) : p))
      );
      setFifo((prev) =>
        prev.map((p) => (p.state === "ejecutando" ? setReadyProcess(p) : p))
      );
      setCurrentExecuting(null);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isRunning,
    speed,
    executeNextProcess,
    addProcess,
    processes.length,
    waitingQueue.length,
  ]);

  return {
    processes,
    waitingQueue,
    memory,
    fifo,
    fat,
    files,
    isRunning,
    currentExecuting,
    speed,
    addProcess,
    removeFile,
    clearSimulator,
    downloadState,
    downloadFile,
    downloadFat,
    toggleSimulator,
    changeSpeed,
    stats: {
      memory: getMemoryStats(),
      fat: getFATStats(),
      processesActive: processes.length,
      processesWaiting: waitingQueue.length,
      filesCount: files.length,
    },
  };
}
