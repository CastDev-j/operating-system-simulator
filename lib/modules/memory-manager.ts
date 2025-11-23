import type { Process, MemoryFrame } from "@/lib/types/simulator"

const TOTAL_FRAMES = 32
let memoryFrames: MemoryFrame[] = Array.from({ length: TOTAL_FRAMES }, (_, i) => ({
  frameNumber: i,
  occupied: false,
  processId: null,
  pageNumber: null,
}))

export function canAllocateMemory(process: Process): boolean {
  const freeFrames = memoryFrames.filter((f) => !f.occupied).length
  return freeFrames >= process.pages.length
}

export function allocateMemory(process: Process): { frames: MemoryFrame[]; success: boolean } {
  const freeFrames = memoryFrames.filter((f) => !f.occupied)

  if (freeFrames.length < process.pages.length) {
    return { frames: [...memoryFrames], success: false }
  }

  process.pages.forEach((page, index) => {
    const frame = freeFrames[index]
    if (frame) {
      frame.occupied = true
      frame.processId = process.id
      frame.pageNumber = page.pageNumber
      page.frameNumber = frame.frameNumber

      const pageTableEntry = process.pageTable.find((p) => p.pageNumber === page.pageNumber)
      if (pageTableEntry) {
        pageTableEntry.frameNumber = frame.frameNumber
        pageTableEntry.valid = true
      }
    }
  })

  return { frames: [...memoryFrames], success: true }
}

export function deallocateMemory(process: Process): MemoryFrame[] {
  process.pages.forEach((page) => {
    const frame = memoryFrames.find((f) => f.processId === process.id && f.pageNumber === page.pageNumber)
    if (frame) {
      frame.occupied = false
      frame.processId = null
      frame.pageNumber = null
    }
  })

  return [...memoryFrames]
}

export function getMemoryState(): MemoryFrame[] {
  return [...memoryFrames]
}

export function setMemoryState(frames: MemoryFrame[]) {
  memoryFrames = frames
}

export function getMemoryStats() {
  const occupied = memoryFrames.filter((f) => f.occupied).length
  const free = TOTAL_FRAMES - occupied
  return { total: TOTAL_FRAMES, occupied, free }
}
