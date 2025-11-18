import { useOllamaHealth } from '@/hooks/useOllamaHealth';

function App() {
  const { status, isChecking } = useOllamaHealth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Daily Inspirational Assistant
        </h1>

        {/* Connection Status */}
        <div className="mb-6">
          {isChecking && (
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Checking Ollama connection...</span>
            </div>
          )}

          {!isChecking && status === 'connected' && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="font-medium">Ollama Connected</span>
            </div>
          )}

          {!isChecking && status === 'disconnected' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start space-x-3">
                <svg
                  className="h-6 w-6 text-red-500 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div>
                  <p className="font-semibold text-red-800">
                    Ollama is not running
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Please start Ollama on your machine to use this application.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isChecking && status === 'error' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start space-x-3">
                <svg
                  className="h-6 w-6 text-yellow-500 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p className="font-semibold text-yellow-800">
                    Failed to connect to Ollama
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    There was an error checking the connection. Please verify
                    Ollama is running on http://localhost:11434
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
