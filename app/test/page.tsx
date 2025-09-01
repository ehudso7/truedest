'use client'

import { useState } from 'react'

export default function TestPage() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('Click the button!')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Page - Verify Interactivity</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Counter Test</h2>
          <p className="mb-4">Count: {count}</p>
          <button
            onClick={() => {
              setCount(count + 1)
              setMessage(`Button clicked ${count + 1} times!`)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Click Me
          </button>
          <p className="mt-4 text-gray-600">{message}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
          <div className="space-y-2">
            <a href="/" className="block text-blue-600 hover:underline">Go to Home (regular link)</a>
            <button
              onClick={() => window.location.href = '/login'}
              className="block text-blue-600 hover:underline"
            >
              Go to Login (JS navigation)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}