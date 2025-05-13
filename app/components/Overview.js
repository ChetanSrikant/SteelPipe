"use client";

import Image from "next/image";

export default function Overview() {
  return (
    <section className="relative h-[500px] w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-14">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Your Complete Forecasting Solution
            </h2>
            <p className="text-lg text-gray-600">
              Our platform combines powerful analytics with intuitive design to give you 
              the insights you need, when you need them.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-1">✓</div>
                <p className="ml-3 text-gray-700">
                  <span className="font-medium">Real-time updates</span> - Stay informed with live data feeds
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-1">✓</div>
                <p className="ml-3 text-gray-700">
                  <span className="font-medium">Multi-device sync</span> - Seamless experience across all your devices
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-1">✓</div>
                <p className="ml-3 text-gray-700">
                  <span className="font-medium">AI-powered insights</span> - Accurate predictions for better decision making
                </p>
              </li>
            </ul>
          </div>
          
          {/* Image */}
          <div className="relative h-150 md:h-100 rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/overview.jpg"
              alt="Dashboard overview"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}