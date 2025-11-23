import type { Process, Page, PageTableEntry } from "@/lib/types/simulator"

let processCounter = 0
const PAGE_SIZE = 4

export function createProcess(): Process {
  processCounter++
  const pagesNeeded = Math.floor(Math.random() * 8) + 1
  const size = pagesNeeded * PAGE_SIZE
  const timeRemaining = Math.floor(Math.random() * 11) + 5
  const priority = Math.floor(Math.random() * 3) + 1

  const pages: Page[] = Array.from({ length: pagesNeeded }, (_, i) => ({
    processId: `P${processCounter}`,
    pageNumber: i,
    frameNumber: -1,
    timestamp: Date.now(),
  }))

  const pageTable: PageTableEntry[] = pages.map((p) => ({
    pageNumber: p.pageNumber,
    frameNumber: -1,
    valid: false,
  }))

  return {
    id: `P${processCounter}`,
    size,
    pages,
    pageTable,
    state: "listo",
    timeRemaining,
    priority,
    createdAt: Date.now(),
  }
}

export function terminateProcess(process: Process): Process {
  return {
    ...process,
    state: "terminado",
    timeRemaining: 0,
  }
}

export function executeProcess(process: Process): Process {
  return {
    ...process,
    state: "ejecutando",
    timeRemaining: Math.max(0, process.timeRemaining - 1),
  }
}

export function setReadyProcess(process: Process): Process {
  return {
    ...process,
    state: "listo",
  }
}

export function resetProcessCounter() {
  processCounter = 0
}
