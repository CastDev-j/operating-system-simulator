import type { FATEntry, FileEntry } from "@/lib/types/simulator";

const TOTAL_CLUSTERS = 128;

// FAT internamente usa: free=true (disponible), next = número del siguiente cluster, next = -1 (EOF), cluster 0 reservado (header)
let fatTable: FATEntry[] = Array.from({ length: TOTAL_CLUSTERS }, (_, i) => ({
  cluster: i,
  free: i !== 0, // header no está libre
  next: null, // null mientras está libre, luego apunta al siguiente o -1 para EOF
  processId: null,
}));

let fileCounter = 0;

export function resetFAT(): void {
  fatTable = Array.from({ length: TOTAL_CLUSTERS }, (_, i) => ({
    cluster: i,
    free: i !== 0,
    next: null,
    processId: null,
  }));
}

export function canCreateFile(): boolean {
  const freeClusters = fatTable.filter((f) => f.free && f.cluster !== 0).length;
  return freeClusters >= 1;
}

export function isFATFull(): boolean {
  return fatTable.filter((f) => f.free && f.cluster !== 0).length === 0;
}

export function createFile(processId: string, size: number): FileEntry | null {
  const clustersNeeded = Math.floor(Math.random() * 5) + 1;
  const freeClusters = fatTable.filter((f) => f.free && f.cluster !== 0);

  if (freeClusters.length < clustersNeeded) {
    return null;
  }

  fileCounter++;
  const allocatedClusters: number[] = [];

  for (let i = 0; i < clustersNeeded; i++) {
    const cluster = freeClusters[i];
    if (cluster) {
      cluster.free = false;
      cluster.processId = processId;
      allocatedClusters.push(cluster.cluster);

      if (i < clustersNeeded - 1) {
        cluster.next = freeClusters[i + 1].cluster;
      } else {
        cluster.next = -1; // EOF
      }
    }
  }

  const content = generateRandomContent(size);

  return {
    id: fileCounter,
    name: `archivo_${fileCounter}.txt`,
    size: clustersNeeded,
    content,
    clusters: allocatedClusters,
    createdAt: Date.now(),
  };
}

export function deleteFile(file: FileEntry): void {
  file.clusters.forEach((clusterNum) => {
    const cluster = fatTable.find((f) => f.cluster === clusterNum);
    if (cluster) {
      cluster.free = true;
      cluster.next = null;
      cluster.processId = null;
    }
  });
}

function generateRandomContent(size: number): string {
  const words = [
    "proceso",
    "memoria",
    "datos",
    "sistema",
    "archivo",
    "cluster",
    "pagina",
    "frame",
  ];
  let content = `Contenido del archivo generado automáticamente\n\n`;

  for (let i = 0; i < size * 10; i++) {
    content += words[Math.floor(Math.random() * words.length)] + " ";
    if (i % 10 === 9) content += "\n";
  }

  return content;
}

export function getFATState(): FATEntry[] {
  return [...fatTable];
}

export function setFATState(fat: FATEntry[]) {
  fatTable = fat;
}

export function getFATStats() {
  const free = fatTable.filter((f) => f.free && f.cluster !== 0).length;
  const occupied = fatTable.filter((f) => !f.free && f.cluster !== 0).length;
  return { total: TOTAL_CLUSTERS - 1, occupied, free };
}

export function resetFileCounter() {
  fileCounter = 0;
}
