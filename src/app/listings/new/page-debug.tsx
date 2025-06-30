'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [query, setQuery] = useState('');
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <div className="max-w-md">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border p-2 flex-1"
            placeholder="Search for a game..."
          />
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => console.log('Search:', query)}
          >
            Search
          </button>
        </div>
        <div className="border p-4">
          <p>This is a minimal debug page to test the layout.</p>
          <p>If this works, we'll gradually add back components.</p>
        </div>
      </div>
    </div>
  );
}
