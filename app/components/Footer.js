"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-6 flex flex-wrap justify-between">
        <div className="w-full md:w-1/4 mb-6 md:mb-0">
          <h3 className="text-lg font-bold">Why Innodatatics?</h3>
          <p className="text-sm text-gray-400 mt-2">
            At Innodatatics, we bring expertise across industries, delivering
            scalable AI solutions in healthcare, manufacturing, finance, and
            retail.
          </p>
        </div>
        <div className="w-full md:w-1/4 mb-6 md:mb-0">
          <h3 className="text-lg font-bold">Quick Links</h3>
          <ul className="mt-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Services
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Projects
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        <div className="w-full md:w-1/4 mb-6 md:mb-0">
          <h3 className="text-lg font-bold">Resources</h3>
          <ul className="mt-2 text-sm text-gray-400">
            <li>
              <Link href="#" className="hover:text-white">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Blog & Insights
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div className="w-full md:w-1/4">
          <h3 className="text-lg font-bold">Contact</h3>
          <p className="text-sm text-gray-400 mt-2">Phone: +91 76739 55077</p>
          <p className="text-sm text-gray-400">Email: info@innodatatics.com</p>
          <p className="text-sm text-gray-400">
            Address: T Hub Phase 2, Hyderabad, India
          </p>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm mt-6">
        © 2024 Innodatatics Inc
      </div>
    </footer>
  );
}