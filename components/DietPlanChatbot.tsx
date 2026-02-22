'use client'

import { useMemo, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ChatRole = 'assistant' | 'user'

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
}

type DietGoal = 'maintenance' | 'weight-loss' | 'weight-gain' | 'sensitive-stomach'

interface DietPlanChatbotProps {
  petName?: string
  species?: string
  ageYears?: number | null
  weightKg?: number | null
}

const speciesMealTips: Record<string, string> = {
  dog: 'Use complete dog food + boiled lean protein + fiber-rich vegetables (pumpkin/carrot). Avoid chocolate, grapes, onion.',
  cat: 'Prioritize high-protein wet food. Keep carbs low. Avoid milk-heavy diet, onion, garlic, chocolate.',
  cow: 'Balanced fodder plan: green fodder + dry roughage + mineral mix + clean water. Avoid sudden feed changes.',
  goat: 'Mix browse/forage + dry fodder + mineral mix + clean water. Introduce concentrates gradually.',
  other: 'Use species-appropriate complete feed, clean water, and gradual transitions across 5-7 days.',
}

const goalTips: Record<DietGoal, string> = {
  maintenance: 'Maintain a stable routine and portion size based on current activity level.',
  'weight-loss': 'Reduce calories by around 10-15%, increase low-calorie fiber, and avoid frequent treats.',
  'weight-gain': 'Increase calories gradually with nutrient-dense meals and protein support.',
  'sensitive-stomach': 'Use easily digestible meals, smaller portions, and single-protein diet trials.',
}

function normalizeSpecies(raw?: string) {
  const value = (raw || '').trim().toLowerCase()
  if (value.includes('dog')) return 'dog'
  if (value.includes('cat')) return 'cat'
  if (value.includes('cow')) return 'cow'
  if (value.includes('goat')) return 'goat'
  return 'other'
}

function getMealFrequency(ageYears?: number | null) {
  if (ageYears === null || ageYears === undefined) return '2 meals/day (adjust by vet advice).'
  if (ageYears < 1) return '3-4 small meals/day.'
  if (ageYears >= 7) return '2 smaller meals/day with easy digestion focus.'
  return '2 meals/day.'
}

function getCalorieHint(speciesKey: string, weightKg?: number | null, goal?: DietGoal) {
  if (!weightKg || !Number.isFinite(weightKg) || weightKg <= 0) {
    return 'Weight-based calorie estimate unavailable. Share current weight for better suggestions.'
  }

  let kcal = 0
  if (speciesKey === 'cat') {
    kcal = 40 * weightKg
  } else {
    kcal = 30 * weightKg + 70
  }

  if (goal === 'weight-loss') kcal *= 0.85
  if (goal === 'weight-gain') kcal *= 1.1

  return `Approx daily energy target: ${Math.round(kcal)} kcal/day.`
}

function buildSuggestion(params: {
  petName?: string
  species?: string
  ageYears?: number | null
  weightKg?: number | null
  goal: DietGoal
  allergies: string
  question: string
}) {
  const speciesKey = normalizeSpecies(params.species)
  const mealTip = speciesMealTips[speciesKey]
  const mealFrequency = getMealFrequency(params.ageYears)
  const calorieHint = getCalorieHint(speciesKey, params.weightKg, params.goal)
  const knownAllergies = params.allergies.trim()
  const petLabel = params.petName?.trim() || 'your pet'
  const ageLabel =
    params.ageYears === null || params.ageYears === undefined
      ? 'age not provided'
      : `${params.ageYears} year(s)`

  const questionLower = params.question.toLowerCase()
  const hydrationTip =
    questionLower.includes('water') || questionLower.includes('hydrate')
      ? 'Keep fresh water available all day and monitor urine/output.'
      : 'Ensure fresh water is available at all times.'

  return [
    `Diet suggestion for ${petLabel} (${speciesKey}, ${ageLabel}):`,
    `1) Goal: ${goalTips[params.goal]}`,
    `2) Meal structure: ${mealFrequency}`,
    `3) Food focus: ${mealTip}`,
    `4) ${calorieHint}`,
    `5) Allergy note: ${knownAllergies ? `Avoid: ${knownAllergies}.` : 'No allergy info provided; introduce new ingredients one by one.'}`,
    `6) ${hydrationTip}`,
    '7) Monitor stool quality, appetite, and weight weekly. If vomiting/diarrhea continues for 24h+, contact your vet.',
    'This is supportive guidance, not a medical diagnosis.',
  ].join('\n')
}

export default function DietPlanChatbot({
  petName,
  species,
  ageYears,
  weightKg,
}: DietPlanChatbotProps) {
  const [goal, setGoal] = useState<DietGoal>('maintenance')
  const [allergies, setAllergies] = useState('')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi! Ask me anything about your pet diet (weight loss, meal timing, allergies, portioning).',
    },
  ])

  const petContext = useMemo(() => {
    const info: string[] = []
    if (petName) info.push(`Pet: ${petName}`)
    if (species) info.push(`Species: ${species}`)
    if (ageYears !== null && ageYears !== undefined) info.push(`Age: ${ageYears}y`)
    if (weightKg && Number.isFinite(weightKg)) info.push(`Weight: ${weightKg}kg`)
    return info.join(' | ')
  }, [petName, species, ageYears, weightKg])

  const sendMessage = () => {
    const trimmed = query.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }

    const suggestion = buildSuggestion({
      petName,
      species,
      ageYears,
      weightKg,
      goal,
      allergies,
      question: trimmed,
    })

    const assistantMessage: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      text: suggestion,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setQuery('')
  }

  return (
    <div className="rounded-2xl bg-white/75 backdrop-blur-sm border border-white/50 p-5 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Diet Suggestion Chatbot</h3>
          <p className="text-sm text-slate-500">Get instant diet guidance using your pet profile.</p>
        </div>
      </div>

      {petContext && (
        <div className="mb-4 text-xs text-slate-600 bg-cyan-50 border border-cyan-100 rounded-lg px-3 py-2">
          {petContext}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <label className="text-sm text-slate-700">
          <span className="font-medium block mb-1">Goal</span>
          <select
            value={goal}
            onChange={(event) => setGoal(event.target.value as DietGoal)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="maintenance">Maintenance</option>
            <option value="weight-loss">Weight Loss</option>
            <option value="weight-gain">Weight Gain</option>
            <option value="sensitive-stomach">Sensitive Stomach</option>
          </select>
        </label>

        <label className="text-sm text-slate-700">
          <span className="font-medium block mb-1">Allergies / Food to avoid</span>
          <Input
            value={allergies}
            onChange={(event) => setAllergies(event.target.value)}
            placeholder="e.g. chicken, dairy"
          />
        </label>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 h-72 overflow-y-auto space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[92%] rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
              message.role === 'assistant'
                ? 'bg-cyan-50 text-slate-700 border border-cyan-100'
                : 'ml-auto bg-teal-600 text-white'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask: my dog is overweight, what should I feed?"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              sendMessage()
            }
          }}
        />
        <Button
          type="button"
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          onClick={sendMessage}
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        For chronic disease, puppies/kittens under treatment, pregnancy, or severe symptoms, consult your veterinarian.
      </p>
    </div>
  )
}
