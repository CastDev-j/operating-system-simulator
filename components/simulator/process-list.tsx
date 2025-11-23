"use client";

import type { Process } from "@/lib/types/simulator";
import { InfoPopover } from "@/components/simulator/info-popover";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Clock, Layers } from "lucide-react";

interface ProcessListProps {
  processes: Process[];
  waitingQueue: Process[];
  currentExecuting: Process | null;
}

export function ProcessList({
  processes,
  waitingQueue,
  currentExecuting,
}: ProcessListProps) {
  const getStateColor = (state: string) => {
    switch (state) {
      case "ejecutando":
        return "text-emerald-500 border-emerald-500/50 bg-emerald-500/10";
      case "listo":
        return "text-emerald-500 border-emerald-500/50 bg-emerald-500/10";
      case "nuevo":
        return "text-amber-500 border-amber-500/50 bg-amber-500/10";
      default:
        return "text-gray-500 border-gray-500/50 bg-gray-500/10";
    }
  };

  return (
    <div className="space-y-4" id="processes-section">
      <div className="flex items-center gap-2">
        <Cpu className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-semibold text-foreground">Cola FIFO</h2>
        <span className="text-sm text-muted-foreground">
          ({processes.length})
        </span>
        <InfoPopover
          title="Cola FIFO - Gestión de Procesos"
          description="Algoritmo de planificación First-In-First-Out (FIFO). Los procesos se ejecutan en orden de llegada hasta completar su tiempo de vida (5-15 segundos). Cada proceso requiere 1-8 páginas de memoria. Si no hay espacio disponible, el proceso espera en la cola hasta que se libere memoria."
        />
      </div>

      <div
        className={`border border-border rounded-lg p-4 bg-card overflow-y-auto custom-scrollbar ${
          waitingQueue.length > 0 ? "h-[200px]" : "h-[330px]"
        }`}
      >
        <AnimatePresence mode="popLayout">
          {processes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-muted-foreground py-8"
            >
              No hay procesos en cola
            </motion.div>
          ) : (
            <div className="space-y-2">
              {processes.map((process, index) => (
                <motion.div
                  key={process.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                  className={`flex items-center justify-between border rounded-lg p-3 ${
                    currentExecuting?.id === process.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {process.id}
                      </span>
                      <span
                        className={`text-xs border px-2 py-0.5 rounded ${getStateColor(
                          process.state
                        )}`}
                      >
                        {process.state}
                      </span>
                      {index === 0 && (
                        <span className="text-xs text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded">
                          Siguiente
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {process.timeRemaining}s
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {process.pages.length} páginas
                      </span>
                      <span>Prioridad: {process.priority}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {waitingQueue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              En Espera
            </h3>
            <span className="text-xs text-muted-foreground">
              ({waitingQueue.length})
            </span>
          </div>
          <div className="border border-border rounded-lg p-3 bg-card/50 h-[85px] overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {waitingQueue.map((process) => (
                <div
                  key={process.id}
                  className="text-xs text-muted-foreground flex items-center gap-2 py-1"
                >
                  <span className="font-mono">{process.id}</span>
                  <span>•</span>
                  <span>{process.pages.length} páginas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
