"use client";

import Link from "next/link";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link href="/" className="flex items-center py-4 px-2">
                <img
                  src="/logo.png"
                  alt="MPL Logo"
                  className="h-8 w-auto"
                  style={{ maxHeight: "32px" }}
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300"
              >
                Home
              </Link>
              <Link
                href="#about"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300"
              >
                About Us
              </Link>
              <Link
                href="#services"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300"
              >
                Services
              </Link>
              <Link
                href="#clients"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300"
              >
                Clients
              </Link>
              <Link
                href="#"
                className="py-4 px-2 text-gray-500 font-semibold hover:text-blue-500 transition duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-blue-500 hover:text-white transition duration-300"
            >
              Log in
            </Link>
            <Link
              href="#"
              className="py-2 px-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-400 transition duration-300"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}