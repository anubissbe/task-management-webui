import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>This is a test page to verify the app is loading correctly.</p>
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        aria-label="Toggle theme"
        onClick={() => {
          document.documentElement.classList.toggle('dark');
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
};