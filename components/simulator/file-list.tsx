"use client";

import type { FileEntry } from "@/lib/types/simulator";
import { Button } from "@/components/ui/button";
import { InfoPopover } from "@/components/simulator/info-popover";
import { PreviewDialog } from "@/components/simulator/preview-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Trash2, Eye } from "lucide-react";
import { useState } from "react";

interface FileListProps {
  files: FileEntry[];
  onDownload: (file: FileEntry) => void;
  onDelete: (file: FileEntry) => void;
}

export function FileList({ files, onDownload, onDelete }: FileListProps) {
  const [previewing, setPreviewing] = useState<FileEntry | null>(null);

  return (
    <div className="space-y-4" id="files-section">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-semibold text-foreground">Archivos</h2>
        <span className="text-sm text-muted-foreground">({files.length})</span>
        <InfoPopover
          title="Gestión de Archivos"
          description="Lista de archivos generados al completarse los procesos. Cada archivo ocupa de 1 a 5 clusters. Ahora puedes previsualizar el contenido antes de descargar usando el botón de ojo. Descargar (verde), eliminar (rojo) y liberar sus clusters en la FAT."
        />
      </div>

      <div className="border border-border rounded-lg p-3 sm:p-4 bg-card h-[250px] sm:h-[330px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {files.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-muted-foreground py-8"
            >
              No hay archivos generados
            </motion.div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                  className="flex items-center justify-between border border-border bg-muted/50 rounded-lg p-3"
                >
                  <div className="flex-1 space-y-1 min-w-0">
                    <button
                      onClick={() => setPreviewing(file)}
                      className="font-mono text-sm font-medium text-foreground truncate text-left hover:underline"
                      title="Ver preview"
                    >
                      {file.name}
                    </button>
                    <div className="text-xs text-muted-foreground">
                      <span>{file.size} clusters</span>
                      <span className="mx-1">•</span>
                      <span>{file.clusters.join("→")}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewing(file)}
                      className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 shrink-0"
                      aria-label="Previsualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownload(file)}
                      className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 shrink-0"
                      aria-label="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(file)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {previewing && (
        <PreviewDialog
          open={!!previewing}
          onClose={() => setPreviewing(null)}
          title={previewing.name}
          description={`Clusters: ${previewing.clusters.join("→")} · Ocupa ${
            previewing.size
          } cluster(s)`}
          icon={<FileText className="h-5 w-5 text-emerald-500" />}
          content={previewing.content}
          onDownload={() => onDownload(previewing)}
          downloadLabel="Descargar"
        />
      )}
    </div>
  );
}
