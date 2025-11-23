"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ReactNode } from "react";

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  content: string;
  onDownload: () => void;
  downloadLabel?: string;
}

export function PreviewDialog({
  open,
  onClose,
  title,
  description,
  icon,
  content,
  onDownload,
  downloadLabel = "Descargar",
}: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title.startsWith("Preview:") ? title : `Preview: ${title}`}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-2 border rounded-md bg-muted/40 p-3 sm:p-4 max-h-[60vh] sm:max-h-[400px] overflow-auto custom-scrollbar">
          <pre className="text-[11px] sm:text-xs font-mono whitespace-pre-wrap leading-relaxed">
            {content}
          </pre>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onDownload();
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloadLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
