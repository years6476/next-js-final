'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { isUsernameAvailable, createUserProfile } from '@/lib/firestore'
import { useSignupStore } from '@/store/signupStore'
import clsx from 'clsx'

/* ─── Shared Input ─────────────────────────────────── */
function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  rightElement,
  autoComplete,
}: {
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  rightElement?: React.ReactNode
  autoComplete?: string
}) {
  return (
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={clsx(
          'w-full rounded-2xl px-4 py-4 text-base',
          'bg-[#F3F4F6] dark:bg-[#1E293B]',
          'text-[#111827] dark:text-white',
          'placeholder-[#6B7280] dark:placeholder-[#94A3B8]',
          'shadow-sm border-none outline-none',
          'transition-all duration-200',
          rightElement ? 'pr-12' : ''
        )}
      />
      {rightElement && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  )
}

/* ─── Next Button ──────────────────────────────────── */
function NextButton({
  onClick,
  disabled = false,
  label = 'Next',
  loading = false,
}: {
  onClick: () => void
  disabled?: boolean
  label?: string
  loading?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'w-full rounded-full py-4 text-base font-semibold text-white',
        'bg-sky-400 transition-all duration-200',
        'shadow-md active:scale-95',
        (disabled || loading) && 'opacity-50 cursor-not-allowed active:scale-100'
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Processing...
        </span>
      ) : label}
    </button>
  )
}

/* ─── Step Header ──────────────────────────────────── */
function StepHeader({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex justify-end mb-6">
      <span className="text-sm font-medium text-[#6B7280] dark:text-[#94A3B8]">
        Step {step} of {total}
      </span>
    </div>
  )
}

/* ─── Progress Bar ─────────────────────────────────── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 bg-[#F3F4F6] dark:bg-[#1E293B] rounded-full mb-8">
      <div
        className="h-1 bg-sky-400 rounded-full transition-all duration-500"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  )
}

/* ─── STEP 1: Full Name ────────────────────────────── */
function Step1({ onNext }: { onNext: () => void }) {
  const { formData, updateField } = useSignupStore()

  return (
    <div className="slide-in-right">
      <StepHeader step={1} total={6} />

      <div className="flex flex-col items-center mb-10">
        <Image src="/logo-icon.png" alt="SkyLink Icon" width={64} height={64} priority />
        <Image src="/logo-text.png" alt="SkyLink" width={140} height={40} className="mt-3" priority />
      </div>

      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm mb-8">
        Let's get started with your basic info.
      </p>

      <Input
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(v) => updateField('fullName', v)}
        autoComplete="name"
      />

      <div className="mt-6">
        <NextButton
          onClick={onNext}
          disabled={formData.fullName.trim().length < 2}
          label="Next"
        />
      </div>
    </div>
  )
}

/* ─── STEP 2: Email ────────────────────────────────── */
function Step2({ onNext }: { onNext: () => void }) {
  const { formData, updateField } = useSignupStore()

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

  return (
    <div className="slide-in-right">
      <StepHeader step={2} total={6} />

      <h1 className="text-2xl font-bold mb-1">What's your email?</h1>
      <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm mb-8">
        You'll use this to log in.
      </p>

      <Input
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={(v) => updateField('email', v)}
        autoComplete="email"
      />

      <div className="mt-6">
        <NextButton onClick={onNext} disabled={!isValid} />
      </div>
    </div>
  )
}

/* ─── STEP 3: Password ─────────────────────────────── */
function Step3({ onNext }: { onNext: () => void }) {
  const { formData, updateField } = useSignupStore()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const rules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  }
  const allRules = Object.values(rules).every(Boolean)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  const canProceed = allRules && passwordsMatch

  const EyeIcon = ({ show }: { show: boolean }) => (
    <button type="button" onClick={() => {}} className="text-[#6B7280] dark:text-[#94A3B8]">
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  )

  return (
    <div className="slide-in-right">
      <StepHeader step={3} total={6} />

      <h1 className="text-2xl font-bold mb-1">Create a password</h1>
      <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm mb-8">
        Make sure it's strong and secure.
      </p>

      <div className="space-y-3">
        <Input
          type={showPass ? 'text' : 'password'}
          placeholder="Password"
          value={formData.password}
          onChange={(v) => updateField('password', v)}
          autoComplete="new-password"
          rightElement={
            <button type="button" onClick={() => setShowPass(!showPass)} className="text-[#6B7280] dark:text-[#94A3B8]">
              <EyeIcon show={showPass} />
            </button>
          }
        />
        <Input
          type={showConfirm ? 'text' : 'password'}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(v) => updateField('confirmPassword', v)}
          autoComplete="new-password"
          rightElement={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-[#6B7280] dark:text-[#94A3B8]">
              <EyeIcon show={showConfirm} />
            </button>
          }
        />
      </div>

      {/* Validation */}
      <div className="mt-4 space-y-1.5">
        {[
          { key: 'length', label: 'Minimum 8 characters' },
          { key: 'upper', label: '1 Uppercase letter' },
          { key: 'lower', label: '1 Lowercase letter' },
          { key: 'number', label: '1 Number' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span className={rules[key as keyof typeof rules] ? 'text-green-500' : 'text-[#94A3B8]'}>
              {rules[key as keyof typeof rules] ? '✓' : '○'}
            </span>
            <span className={rules[key as keyof typeof rules] ? 'text-green-500' : 'text-[#6B7280] dark:text-[#94A3B8]'}>
              {label}
            </span>
          </div>
        ))}
        {formData.confirmPassword.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className={passwordsMatch ? 'text-green-500' : 'text-red-400'}>
              {passwordsMatch ? '✓' : '✗'}
            </span>
            <span className={passwordsMatch ? 'text-green-500' : 'text-red-400'}>
              Passwords match
            </span>
          </div>
        )}
      </div>

      <div className="mt-6">
        <NextButton onClick={onNext} disabled={!canProceed} />
      </div>
    </div>
  )
}

/* ─── STEP 4: Username ─────────────────────────────── */
function Step4({ onNext }: { onNext: () => void }) {
  const { formData, updateField } = useSignupStore()
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const debounceRef = useRef<NodeJS.Timeout>()

  const usernameRegex = /^[a-z0-9_.]{4,20}$/

  const checkUsername = useCallback(async (value: string) => {
    if (!usernameRegex.test(value)) {
      setStatus('invalid')
      return
    }
    setStatus('checking')
    try {
      const available = await isUsernameAvailable(value)
      setStatus(available ? 'available' : 'taken')
    } catch {
      setStatus('idle')
    }
  }, [])

  const handleChange = (value: string) => {
    const lower = value.toLowerCase().replace(/[^a-z0-9_.]/g, '')
    updateField('username', lower)
    setStatus('idle')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (lower.length >= 4) {
      debounceRef.current = setTimeout(() => checkUsername(lower), 600)
    }
  }

  const statusUI = {
    checking: <span className="text-sm text-[#94A3B8]">Checking...</span>,
    available: <span className="text-sm text-green-500">✅ Username Available</span>,
    taken: <span className="text-sm text-red-400">❌ Username Already Taken</span>,
    invalid: (
      <span className="text-sm text-[#94A3B8]">
        4–20 chars, only a-z 0-9 . _
      </span>
    ),
    idle: null,
  }

  return (
    <div className="slide-in-right">
      <StepHeader step={4} total={6} />

      <h1 className="text-2xl font-bold mb-1">Choose your username</h1>
      <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm mb-8">
        This will be your unique identity.
      </p>

      <Input
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        autoComplete="username"
      />

      <div className="mt-2 min-h-[20px]">{statusUI[status]}</div>

      <div className="mt-4">
        <NextButton onClick={onNext} disabled={status !== 'available'} />
      </div>
    </div>
  )
}

/* ─── STEP 5: Location + DOB ───────────────────────── */
function Step5({ onNext }: { onNext: () => void }) {
  const { formData, updateField } = useSignupStore()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  const searchLocation = async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      const places = data.map((item: { display_name: string }) => item.display_name)
      setSuggestions(places)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (value: string) => {
    updateField('location', value)
    setSuggestions([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchLocation(value), 500)
  }

  const selectSuggestion = (place: string) => {
    updateField('location', place)
    setSuggestions([])
  }

  const canProceed = formData.location.trim().length > 2 && formData.dateOfBirth.length > 0

  // Max DOB: must be at least 13 years old
  const maxDate = (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 13)
    return d.toISOString().split('T')[0]
  })()

  return (
    <div className="slide-in-right">
      <StepHeader step={5} total={6} />

      <h1 className="text-2xl font-bold mb-1">Where are you from?</h1>
      <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm mb-8">
        Help people find you.
      </p>

      <div className="relative">
        <Input
          placeholder="Location"
          value={formData.location}
          onChange={handleLocationChange}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-[#94A3B8]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 rounded-2xl shadow-lg bg-white dark:bg-[#1E293B] overflow-hidden">
            {suggestions.map((place, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(place)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-[#F3F4F6] dark:hover:bg-[#0F172A] transition-colors border-b border-[#F3F4F6] dark:border-[#0F172A] last:border-0"
              >
                📍 {place}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="relative">
          <input
            type="date"
            value={formData.dateOfBirth}
            max={maxDate}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            className={clsx(
              'w-full rounded-2xl px-4 py-4 text-base',
              'bg-[#F3F4F6] dark:bg-[#1E293B]',
              'text-[#111827] dark:text-white',
              'shadow-sm border-none outline-none',
              'appearance-none'
            )}
          />
        </div>
      </div>

      <div className="mt-6">
        <NextButton onClick={onNext} disabled={!canProceed} />
      </div>
    </div>
  )
}

/* ─── STEP 6: Summary + Create ─────────────────────── */
function Step6() {
  const { formData, reset } = useSignupStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const summaryItems = [
    { label: 'Full Name', value: formData.fullName },
    { label: 'Email', value: formData.email },
    { label: 'Username', value: `@${formData.username}` },
    { label: 'Location', value: formData.location },
    { label: 'Date of Birth', value: formData.dateOfBirth },
  ]

  const handleCreate = async () => {
    setLoading(true)
    setError('')
    try {
      // Firebase Auth
      const credential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      const uid = credential.user.uid

      // Firestore profile
      await createUserProfile(uid, {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        location: formData.location,
        dateOfBirth: formData.dateOfBirth,
      })

      reset()
      // Server-side redirect to home
      router.push('/home')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      if (msg.includes('email-already-in-use')) {
        setError('This email is already registered.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="slide-in-right">
      <StepHeader step={6} total={6} />

      <h1 className="text-2xl font-bold mb-1">Almost there!</h1>
      <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm mb-8">
        Review your info before creating your account.
      </p>

      <div className="space-y-3 mb-8">
        {summaryItems.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl px-4 py-4 bg-[#F3F4F6] dark:bg-[#1E293B] shadow-sm"
          >
            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mb-0.5">{label}</p>
            <p className="text-sm font-medium truncate">{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
      )}

      <NextButton
        onClick={handleCreate}
        disabled={loading}
        loading={loading}
        label="Create Account"
      />
    </div>
  )
}

/* ─── MAIN SIGNUP PAGE ─────────────────────────────── */
export default function SignupPage() {
  const { step, nextStep, prevStep } = useSignupStore()
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const goNext = () => {
    setDirection('forward')
    nextStep()
  }

  const goBack = () => {
    setDirection('back')
    prevStep()
  }

  const steps = [
    <Step1 key={1} onNext={goNext} />,
    <Step2 key={2} onNext={goNext} />,
    <Step3 key={3} onNext={goNext} />,
    <Step4 key={4} onNext={goNext} />,
    <Step5 key={5} onNext={goNext} />,
    <Step6 key={6} />,
  ]

  return (
    <main className="min-h-screen flex flex-col">
      <div
        className="flex-1 flex flex-col px-6 pt-safe-top pb-safe-bottom"
        style={{
          paddingTop: 'max(24px, env(safe-area-inset-top))',
          paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Back Button */}
        {step > 1 && (
          <button
            onClick={goBack}
            className="self-start flex items-center gap-1 text-[#6B7280] dark:text-[#94A3B8] mb-2 -ml-1 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
        )}

        {/* Progress */}
        <ProgressBar step={step} total={6} />

        {/* Step Content */}
        <div className="flex-1" key={`step-${step}-${direction}`}>
          {steps[step - 1]}
        </div>

        {/* Login Link */}
        {step === 1 && (
          <p className="text-center text-sm text-[#6B7280] dark:text-[#94A3B8] mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-sky-400 font-medium">
              Log In
            </a>
          </p>
        )}
      </div>
    </main>
  )
}
