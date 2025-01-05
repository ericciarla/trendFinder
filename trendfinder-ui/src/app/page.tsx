'use client'

import { Button } from "@/components/button"
import { useState } from "react"

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const handleClick = async () => {
    try {
      setStatus('loading')
      const response = await fetch('/api/cron', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setMessage('Cron job triggered successfully!')
      } else {
        throw new Error(data.error || 'Failed to trigger cron')
      }
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white font-manrope">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-black">TrendFinder UI</h1>
        <p className="text-sm text-black">
          Sponsored by Firecrawl.dev 🔥
        </p>
      </div>

      <Button 
        onClick={handleClick}
        disabled={status === 'loading'}
        variant={status === 'success' ? 'outline' : 'default'}
        className="mb-4"
      >
        {status === 'loading' ? 'Running...' : 'Trigger TweetFinder'}
      </Button>
      
      {message && (
        <p className={`text-sm ${
          status === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </p>
      )}
    </main>
  )
}