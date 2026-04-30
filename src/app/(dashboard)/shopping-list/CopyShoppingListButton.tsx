'use client'

import { useState } from 'react'

export default function CopyShoppingListButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn-secondary w-full justify-center"
    >
      {copied ? '✓ Liste copiée' : 'Copier la liste'}
    </button>
  )
}
