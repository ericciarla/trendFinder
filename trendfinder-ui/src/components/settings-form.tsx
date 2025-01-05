'use client'

import { useState, useEffect } from "react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"


interface XAccount {
  id: number
  username: string
}

interface Settings {
  cronInterval: number
}

interface ApiKey {
  service: string
  key: string
}

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>({ cronInterval: 15 })
  const [xAccounts, setXAccounts] = useState<XAccount[]>([])
  const [newAccount, setNewAccount] = useState('')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Fetch initial settings
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings')
      const data = await response.json()
      setSettings(data.settings)
      setXAccounts(data.xAccounts)
      setApiKeys(data.apiKeys)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleAddAccount = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/x-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newAccount })
      })
      const data = await response.json()
      setXAccounts([...xAccounts, data])
      setNewAccount('')
    } catch (error) {
      console.error('Failed to add account:', error)
    }
  }

  const handleRemoveAccount = async (id: number) => {
    try {
      await fetch(`http://localhost:3001/api/x-accounts/${id}`, {
        method: 'DELETE'
      })
      setXAccounts(xAccounts.filter(account => account.id !== id))
    } catch (error) {
      console.error('Failed to remove account:', error)
    }
  }

  const handleUpdateApiKey = async (service: string, key: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, key })
      })
      const data = await response.json()
      setApiKeys(apiKeys.map(k => k.service === service ? data : k))
    } catch (error) {
      console.error('Failed to update API key:', error)
    }
  }

  const handleUpdateSettings = async () => {
    try {
      setStatus('loading')
      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (response.ok) {
        setStatus('success')
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      {/* X Accounts Section */}
      <Card>
        <CardHeader>
          <CardTitle>X Accounts to Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input 
              value={newAccount}
              onChange={(e) => setNewAccount(e.target.value)}
              placeholder="@username"
            />
            <Button onClick={handleAddAccount}>Add</Button>
          </div>
          <div className="space-y-2">
            {xAccounts.map(account => (
              <div key={account.id} className="flex justify-between items-center p-2 bg-secondary rounded">
                <span>{account.username}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveAccount(account.id)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['together', 'x', 'firecrawl', 'slack'].map(service => (
            <div key={service} className="space-y-2">
              <label className="text-sm font-medium">{service.toUpperCase()} API Key</label>
              <Input 
                type="password"
                value={apiKeys.find(k => k.service === service)?.key || ''}
                onChange={(e) => handleUpdateApiKey(service, e.target.value)}
                placeholder={`Enter ${service} API key`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cron Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Check Interval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input 
              type="number"
              min="15"
              value={settings?.cronInterval ?? 15} // Default to 15 if settings is null
              onChange={(e) => setSettings({ ...settings, cronInterval: Number(e.target.value) })}
            />
            <span>minutes</span>
          </div>
          <Button 
            onClick={handleUpdateSettings}
            className="mt-4"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}