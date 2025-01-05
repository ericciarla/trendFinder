import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Call the main project's handleCron function
    const response = await fetch('http://localhost:3001/api/cron', {
      method: 'POST',
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger cron' }, { status: 500 })
  }
} 