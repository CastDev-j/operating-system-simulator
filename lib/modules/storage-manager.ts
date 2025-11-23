import type { SimulatorState } from "@/lib/types/simulator"
import { setMemoryState } from "./memory-manager"
import { setFifoState } from "./fifo-manager"
import { setFATState } from "./fat-manager"

const STORAGE_KEY = "os-simulator-state"

export function saveState(state: SimulatorState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

export function loadState(): SimulatorState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const state = JSON.parse(data) as SimulatorState
      setMemoryState(state.memory)
      setFifoState(state.fifo)
      setFATState(state.fat)
      return state
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error)
  }
  return null
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing localStorage:", error)
  }
}
