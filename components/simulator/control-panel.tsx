"use client";

import { Button } from "@/components/ui/button";
import { PreviewDialog } from "@/components/simulator/preview-dialog";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Plus,
  Download,
  Trash2,
  HelpCircle,
  Gauge,
  Eye,
  Database,
} from "lucide-react";
import { useState } from "react";

interface ControlPanelProps {
  isRunning: boolean;
  speed: number;
  onToggle: () => void;
  onAddProcess: () => void;
  onClear: () => void;
  onDownloadState: () => void;
  onDownloadFat: () => void;
  onStartTour: () => void;
  onSpeedChange: (speed: number) => void;
  stats: {
    processesActive: number;
    processesWaiting: number;
    filesCount: number;
    memory: { total: number; occupied: number; free: number };
    fat: { total: number; occupied: number; free: number };
  };
  processes?: any[];
  waitingQueue?: any[];
  currentExecuting?: any;
  files?: any[];
  fat?: any[];
}

export function ControlPanel({
  isRunning,
  speed,
  onToggle,
  onAddProcess,
  onClear,
  onDownloadState,
  onDownloadFat,
  onStartTour,
  onSpeedChange,
  stats,
  processes = [],
  waitingQueue = [],
  currentExecuting = null,
  files = [],
  fat = [],
}: ControlPanelProps) {
  const [previewState, setPreviewState] = useState(false);
  const [previewFat, setPreviewFat] = useState(false);

  const generateStateContent = () => {
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
        procesosActivos: stats.processesActive,
        procesosEnEspera: stats.processesWaiting,
        procesoActual: currentExecuting?.id || "ninguno",
        memoria: stats.memory,
        fat: stats.fat,
        archivos: files.length,
      },
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(state, null, 2);
  };

  const generateFatContent = () => {
    const lines: string[] = [];
    lines.push("Resumen FAT");
    lines.push(`Total clusters útiles: ${stats.fat.total}`);
    lines.push(`Ocupados: ${stats.fat.occupied} | Libres: ${stats.fat.free}`);
    lines.push(`Timestamp: ${new Date().toISOString()}`);
    lines.push("");
    lines.push("Detalle por cluster (cluster 0 es HEADER):");
    lines.push("Idx  Estado    Proc    Next");
    lines.push("---- --------- ------- -----");
    fat.forEach((f) => {
      const estado =
        f.cluster === 0
          ? "HEADER"
          : f.free
          ? "LIBRE"
          : f.next === -1
          ? "EOF"
          : "DATA";
      const proc = f.processId ?? "-";
      const next =
        f.free || f.cluster === 0 ? "-" : f.next === -1 ? "EOF" : f.next;
      lines.push(
        `${String(f.cluster).padStart(3, "0")}  ${estado.padEnd(8)} ${String(
          proc
        ).padEnd(7)} ${String(next).padEnd(5)}`
      );
    });
    return lines.join("\n");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
      id="control-panel"
    >
      <div className="border border-border rounded-lg p-3 sm:p-4 bg-card">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <Button
            onClick={onToggle}
            className={`${
              isRunning
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            } w-full sm:w-auto`}
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Detener
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Iniciar
              </>
            )}
          </Button>

          <Button
            onClick={onAddProcess}
            variant="outline"
            className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 bg-transparent w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Proceso
          </Button>

          <div className="hidden sm:block w-px bg-border mx-1" />

          <Button onClick={() => setPreviewState(true)} variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Estado
          </Button>

          <Button onClick={() => setPreviewFat(true)} variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            FAT
          </Button>

          <div className="hidden sm:block w-px bg-border mx-1" />

          <Button
            onClick={onClear}
            variant="outline"
            className="text-red-600 hover:bg-red-500/10 bg-transparent w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar
          </Button>

          <Button
            onClick={onStartTour}
            variant="outline"
            className="ml-auto bg-transparent w-full sm:w-auto"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Tour
          </Button>
        </div>
      </div>

      <div
        className="border border-border rounded-lg p-4 bg-card"
        id="speed-control-section"
      >
        <div className="flex items-center gap-3">
          <Gauge className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-foreground">
            Control de Velocidad:
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={speed === 2000 ? "default" : "outline"}
              onClick={() => onSpeedChange(2000)}
              className={
                speed === 2000
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
              }
            >
              0.5x
            </Button>
            <Button
              size="sm"
              variant={speed === 1000 ? "default" : "outline"}
              onClick={() => onSpeedChange(1000)}
              className={
                speed === 1000
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
              }
            >
              1x
            </Button>
            <Button
              size="sm"
              variant={speed === 500 ? "default" : "outline"}
              onClick={() => onSpeedChange(500)}
              className={
                speed === 500
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
              }
            >
              2x
            </Button>
            <Button
              size="sm"
              variant={speed === 250 ? "default" : "outline"}
              onClick={() => onSpeedChange(250)}
              className={
                speed === 250
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
              }
            >
              4x
            </Button>
            <Button
              size="sm"
              variant={speed === 100 ? "default" : "outline"}
              onClick={() => onSpeedChange(100)}
              className={
                speed === 100
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
              }
            >
              10x
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="border border-border rounded-lg p-3 bg-card">
          <div className="text-xs text-muted-foreground mb-1">Procesos</div>
          <div className="text-2xl font-bold text-emerald-500">
            {stats.processesActive}
          </div>
          {stats.processesWaiting > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              +{stats.processesWaiting} esperando
            </div>
          )}
        </div>

        <div className="border border-border rounded-lg p-3 bg-card">
          <div className="text-xs text-muted-foreground mb-1">Memoria</div>
          <div className="text-2xl font-bold text-emerald-500">
            {stats.memory.occupied}/{stats.memory.total}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.memory.free} libres
          </div>
        </div>

        <div className="border border-border rounded-lg p-3 bg-card">
          <div className="text-xs text-muted-foreground mb-1">Clusters FAT</div>
          <div className="text-2xl font-bold text-emerald-500">
            {stats.fat.occupied}/{stats.fat.total}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.fat.free} libres
          </div>
        </div>

        <div className="border border-border rounded-lg p-3 bg-card">
          <div className="text-xs text-muted-foreground mb-1">Archivos</div>
          <div className="text-2xl font-bold text-amber-500">
            {stats.filesCount}
          </div>
        </div>

        <div className="border border-border rounded-lg p-3 bg-card">
          <div className="text-xs text-muted-foreground mb-1">Estado</div>
          <div
            className={`text-lg font-bold ${
              isRunning ? "text-emerald-500" : "text-muted-foreground"
            }`}
          >
            {isRunning ? "Ejecutando" : "Detenido"}
          </div>
        </div>
      </div>

      <PreviewDialog
        open={previewState}
        onClose={() => setPreviewState(false)}
        title="Estado del Sistema"
        description="Vista previa del estado completo del simulador"
        icon={<Download className="h-5 w-5 text-emerald-500" />}
        content={generateStateContent()}
        onDownload={onDownloadState}
        downloadLabel="Descargar"
      />

      <PreviewDialog
        open={previewFat}
        onClose={() => setPreviewFat(false)}
        title="Sistema FAT"
        description="Vista previa de la tabla de asignación de archivos (FAT) con formato tabular"
        icon={<Database className="h-5 w-5 text-emerald-500" />}
        content={generateFatContent()}
        onDownload={onDownloadFat}
        downloadLabel="Descargar"
      />
    </motion.div>
  );
}
