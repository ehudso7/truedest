'use client'

export default function SimpleTest() {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Simple Test</h1>
      <button 
        onClick={() => alert('Button clicked!')}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Click to test JavaScript
      </button>
    </div>
  )
}