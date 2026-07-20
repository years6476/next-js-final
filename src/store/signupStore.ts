import { create } from 'zustand'
import type { SignupFormData } from '@/types/user'

interface SignupStore {
  step: number
  formData: SignupFormData
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateField: <K extends keyof SignupFormData>(key: K, value: SignupFormData[K]) => void
  reset: () => void
}

const initialFormData: SignupFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  username: '',
  location: '',
  dateOfBirth: '',
}

export const useSignupStore = create<SignupStore>((set) => ({
  step: 1,
  formData: initialFormData,
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 6) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  updateField: (key, value) =>
    set((s) => ({ formData: { ...s.formData, [key]: value } })),
  reset: () => set({ step: 1, formData: initialFormData }),
}))
