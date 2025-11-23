"use client";

import { useSimulator } from "@/lib/hooks/use-simulator";
import { useTour } from "@/lib/hooks/use-tour";
import { ProcessList } from "@/components/simulator/process-list";
import { MemoryView } from "@/components/simulator/memory-view";
import { FatSystem } from "@/components/simulator/fat-system";
import { FileList } from "@/components/simulator/file-list";
import { ControlPanel } from "@/components/simulator/control-panel";
import { motion } from "framer-motion";

export default function SimulatorPage() {
  const {
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
    stats,
  } = useSimulator();

  const { startTour } = useTour();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Simulador de Sistema Operativo
          </h1>
          <p className="text-muted-foreground">
            Simulación interactiva de gestión de procesos con algoritmo FIFO,
            memoria virtual con paginación (32 marcos de 4KB), y sistema de
            archivos FAT con 128 clusters. Observa en tiempo real cómo un
            sistema operativo administra recursos, ejecuta procesos y almacena
            archivos.
          </p>
        </motion.header>

        <div id="control-panel-section">
          <ControlPanel
            isRunning={isRunning}
            speed={speed}
            onToggle={toggleSimulator}
            onAddProcess={addProcess}
            onClear={clearSimulator}
            onDownloadState={downloadState}
            onDownloadFat={downloadFat}
            onStartTour={startTour}
            onSpeedChange={changeSpeed}
            stats={stats}
            processes={fifo}
            waitingQueue={waitingQueue}
            currentExecuting={currentExecuting}
            files={files}
            fat={fat}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div id="processes-section">
            <ProcessList
              processes={fifo}
              waitingQueue={waitingQueue}
              currentExecuting={currentExecuting}
            />
          </div>
          <div id="memory-section">
            <MemoryView memory={memory} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div id="fat-section">
            <FatSystem fat={fat} />
          </div>
          <div id="files-section">
            <FileList
              files={files}
              onDownload={downloadFile}
              onDelete={removeFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
