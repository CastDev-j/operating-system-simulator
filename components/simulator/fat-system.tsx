"use client";

import type { FATEntry } from "@/lib/types/simulator";
import { InfoPopover } from "@/components/simulator/info-popover";
import { motion } from "framer-motion";
import { Database } from "lucide-react";

interface FatSystemProps {
  fat: FATEntry[];
}

export function FatSystem({ fat }: FatSystemProps) {
  const freeClusters = fat.filter((f) => f.free && f.cluster !== 0).length;
  const totalClusters = fat.length - 1;
  const percentage = Math.round((freeClusters / totalClusters) * 100);

  const getClusterColor = (entry: FATEntry) => {
    if (entry.cluster === 0) return "bg-emerald-500 text-white";
    if (entry.free) return "bg-muted text-muted-foreground";
    if (entry.next === -1) return "bg-emerald-600 text-white";
    return "bg-emerald-500 text-white";
  };

  const getClusterTitle = (entry: FATEntry) => {
    if (entry.cluster === 0) return "Cluster 0: HEADER";
    if (entry.free) return `Cluster ${entry.cluster}: LIBRE`;
    if (entry.next === -1)
      return `Cluster ${entry.cluster}: EOF (${entry.processId})`;
    return `Cluster ${entry.cluster}: ${entry.processId} → ${entry.next}`;
  };

  return (
    <div className="space-y-4" id="fat-section">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-semibold text-foreground">Sistema FAT</h2>
        <span className="text-sm text-muted-foreground">
          ({freeClusters}/{totalClusters} libres - {percentage}%)
        </span>
        <InfoPopover
          title="Sistema de Archivos FAT"
          description="File Allocation Table con 128 clusters. El cluster 0 es el header del sistema (siempre verde). Los clusters grises están libres (valor 0). Los verdes claros contienen datos y su valor indica el siguiente cluster en la cadena. Verde oscuro marca el final del archivo (EOF = -1). Cada archivo terminado ocupa de 1 a 5 clusters enlazados."
        />
      </div>
      <div className="border border-border rounded-lg p-3 sm:p-4 bg-card h-fit overflow-auto custom-scrollbar">
        <div className="grid grid-cols-8 xs:grid-cols-10 sm:grid-cols-12 lg:grid-cols-16 gap-1 min-w-max">
          {fat.map((entry) => (
            <motion.div
              key={entry.cluster}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: entry.cluster * 0.005 }}
              className={`aspect-square rounded flex items-center justify-center text-[9px] sm:text-[10px] font-mono ${getClusterColor(
                entry
              )}`}
              title={getClusterTitle(entry)}
            >
              {entry.cluster}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
