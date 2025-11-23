"use client";

import type { MemoryFrame } from "@/lib/types/simulator";
import { InfoPopover } from "@/components/simulator/info-popover";
import { motion } from "framer-motion";
import { HardDrive } from "lucide-react";

interface MemoryViewProps {
  memory: MemoryFrame[];
}

export function MemoryView({ memory }: MemoryViewProps) {
  const occupiedFrames = memory.filter((f) => f.occupied).length;
  const totalFrames = memory.length;
  const percentage = Math.round((occupiedFrames / totalFrames) * 100);

  return (
    <div className="space-y-4" id="memory-section">
      <div className="flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-semibold text-foreground">
          Memoria (Paginación)
        </h2>
        <span className="text-sm text-muted-foreground">
          ({occupiedFrames}/{totalFrames} marcos - {percentage}%)
        </span>
        <InfoPopover
          title="Memoria RAM con Paginación"
          description="Sistema de paginación con 32 marcos de página de 4KB cada uno (128KB total). Cada marco puede contener una página de cualquier proceso. Los marcos verdes muestran qué proceso los está usando. Cuando un proceso termina, libera automáticamente todos sus marcos para que otros procesos en espera puedan usarlos."
        />
      </div>

      <div className="border border-border rounded-lg p-4 bg-card h-fit overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-8 gap-2">
          {memory.map((frame) => (
            <motion.div
              key={frame.frameNumber}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: frame.frameNumber * 0.01 }}
              className={`aspect-square rounded flex flex-col items-center justify-center text-xs font-mono ${
                frame.occupied
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
              title={
                frame.occupied
                  ? `Marco ${frame.frameNumber}: ${frame.processId}, Pág ${frame.pageNumber}`
                  : `Marco ${frame.frameNumber}: Libre`
              }
            >
              <span className="text-[10px]">{frame.frameNumber}</span>
              {frame.occupied && (
                <span className="text-[8px] opacity-80">{frame.processId}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
