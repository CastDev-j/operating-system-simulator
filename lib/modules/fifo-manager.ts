import type { Process } from "@/lib/types/simulator";

let fifoQueue: Process[] = [];

export function addToFifo(process: Process): Process[] {
  fifoQueue.push(process);
  return [...fifoQueue];
}

export function removeFromFifo(): Process[] {
  fifoQueue.shift();
  return [...fifoQueue];
}

export function getFirstInQueue(): Process | null {
  return fifoQueue[0] || null;
}

export function getFifoState(): Process[] {
  return [...fifoQueue];
}

export function setFifoState(queue: Process[]) {
  fifoQueue = queue;
}

export function resetFifo() {
  fifoQueue = [];
}
