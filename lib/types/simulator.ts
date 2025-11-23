export interface Process {
  id: string
  size: number
  pages: Page[]
  pageTable: PageTableEntry[]
  state: "nuevo" | "listo" | "ejecutando" | "terminado"
  timeRemaining: number
  priority: number
  createdAt: number
}

export interface Page {
  processId: number
  pageNumber: number
  frameNumber: number
  timestamp: number
}

export interface PageTableEntry {
  pageNumber: number
  frameNumber: number
  valid: boolean
}

export interface MemoryFrame {
  frameNumber: number
  occupied: boolean
  processId: number | null
  pageNumber: number | null
}

export interface FATEntry {
  cluster: number
  free: boolean
  next: number | null
  processId: number | null
}

export interface FileEntry {
  id: number
  name: string
  size: number
  content: string
  clusters: number[]
  createdAt: number
}

export interface SimulatorState {
  processes: Process[]
  memory: MemoryFrame[]
  fifo: Page[]
  fat: FATEntry[]
  files: FileEntry[]
}
