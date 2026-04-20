import { create } from 'zustand'

interface Pet {
  id: number
  name: string
  pet_type: string
  stage: string
  level: number
  exp: number
  hunger: number
  happiness: number
  energy: number
}

interface PetState {
  pet: Pet | null
  setPet: (pet: Pet) => void
  updateStats: (stats: Partial<Pet>) => void
}

export const usePetStore = create<PetState>((set) => ({
  pet: null,
  setPet: (pet) => set({ pet }),
  updateStats: (stats) => set((state) => ({
    pet: state.pet ? { ...state.pet, ...stats } : null
  }))
}))
