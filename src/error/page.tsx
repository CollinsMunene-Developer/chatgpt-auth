import React from 'react';

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-4">Oops!</h1>
      <p className="text-lg mb-6">Sorry, something went wrong.</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  );
}
