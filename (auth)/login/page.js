"use client";

import { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Replace with actual authentication logic
      console.log("Logging in with", email, password);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect on successful login
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-grow">
        {/* Left Section - Login Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600 mb-8">
              Log in for real-time updates, AI insights, and personalized forecasts.
            </p>
            
            {/* Social Login Buttons */}
            <div className="flex gap-4 mb-6">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg w-full hover:bg-gray-50">
                <FaGoogle className="text-red-500" />
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg w-full hover:bg-gray-50">
                <FaGithub className="text-gray-800" />
                <span>GitHub</span>
              </button>
            </div>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
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
                  placeholder="name@innodatatics.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="flex items-center text-gray-600 text-sm">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right Section - Image */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
          <img 
            src="/login_pic.png" 
            alt="Login Illustration" 
            className="w-4/5 max-w-lg" 
          />
        </div>
      </div>
    </div>
  );
}