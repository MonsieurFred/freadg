'use client'

import { useState } from 'react'
import { addRecipeToCurrentWeekRemote } from '@/lib/meal-plan/storage'
import { type Recipe } from '@/types/database'

export default function AddToWeekButton({ recipe, compact = false }: { recipe: Recipe; compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'adding' | 'added' | 'already_added' | 'full'>('idle')

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (status === 'adding') return

    setStatus('adding')
    const result = await addRecipeToCurrentWeekRemote(recipe)
    setStatus(result.status)
    window.setTimeout(() => setStatus('idle'), 2200)
  }

  const label = {
    idle: '+ Semaine',
    adding: 'Ajout...',
    added: 'Ajouté ✓',
    already_added: 'Déjà prévu',
    full: 'Semaine pleine',
  }[status]

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'adding'}
      style={{
        width: '100%',
        minHeight: compact ? 34 : 38,
        marginTop: 0,
        padding: compact ? '7px 10px' : '9px 12px',
        borderRadius: 4,
        border: status === 'idle' ? '1px solid var(--green)' : '1px solid var(--border)',
        background: status === 'idle' ? 'var(--green)' : status === 'full' ? '#fef2f2' : 'var(--green-pale)',
        color: status === 'full' ? '#dc2626' : status === 'idle' ? '#fff' : 'var(--green)',
        cursor: status === 'adding' ? 'wait' : 'pointer',
        fontSize: compact ? 12 : 13,
        fontWeight: 800,
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  )
}
