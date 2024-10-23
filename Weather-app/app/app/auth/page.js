"use client";
import { useState } from 'react';
import { useAuth } from "@/lib/context/AuthProvider";

export default function Login() {
  const { authState, login } = useAuth();
  const [apiKey, setApiKey] = useState(''); // Local state to hold API key input
  const [error, setError] = useState(''); // Local state to hold error messages

  const handleLogin = async () => {
    setError(''); // Reset error state
    const success = await login(apiKey);
    if (!success) {
      setError('Invalid API key. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {authState.Authorize ? (
        <p className="text-lg text-green-600">
          Authenticated with API Key: <span className="font-bold">{authState.OpenMapAPI}</span>
        </p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 w-80">
          <h2 className="text-xl font-semibold mb-4 text-center">Weather App Login</h2>
          <input
            type="text"
            placeholder="Enter your OpenWeatherMap API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)} // Update local state on input change
            className="border outline-0 border-gray-300 rounded-md p-2 w-full mb-4 focus:outline-none"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white rounded-md py-2 hover:bg-gray-800 transition duration-200"
          >
            Login
          </button>
          {error && <p className="mt-2 text-red-600 text-center">{error}</p>} {/* Display error if any */}
        </div>
      )}
    </div>
  );
}
