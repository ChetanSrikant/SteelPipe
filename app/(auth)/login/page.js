"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import Navbar from "@/app/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      if (data.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-[url('/Background.jpg')] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/Background.jpg')",
        }}
      ></div>
      
      <div className="relative z-10">
        <Navbar />
        
        {/* Left Side Container */}
        <div className="flex justify-start items-center min-h-[calc(100vh-64px)] p-4">
          {/* Transparent Login Container */}
          <div className="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 bg-white/60 text-black rounded-xl p-8 border border-gray-200 shadow-2xl ml-4 md:ml-8 lg:ml-16">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">
              Welcome Back! Log in for real-time updates, AI insights, and personalized forecasts.
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-900 bg-opacity-50 text-red-100 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@mpl.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-100 text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-100 text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500"
                />
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center text-gray-700 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-gray-700">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200"
                >
                  <FaGoogle className="h-5 w-5 text-red-400" />
                  <span className="ml-2">Sign in with Google</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-700">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}