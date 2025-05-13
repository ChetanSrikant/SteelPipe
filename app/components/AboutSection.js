"use client";

import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="relative py-16 md:py-30">
      {/* Background Image with dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      <Image
        src="/about-bg.jpg"
        alt="About Inmodatatics background"
        fill
        className="object-contain"
        style={{ objectPosition: 'right center' }}
        priority
      />
      
      {/* Content Container - Left-aligned and more compact */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="max-w-xl bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-xl text-left ml-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            About Us
          </h2>
          
          <p className="text-base md:text-lg text-gray-700 mb-4">
            At Inmodatatics, we drive innovation through cutting-edge technologies, 
            delivering AI solutions, data analytics, and digital transformation.
          </p>
          
          <p className="text-base md:text-lg text-gray-700 mb-6">
            Founded in 2013, we provide intelligent insights and transformative 
            solutions to industries worldwide.
          </p>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2">
              <p className="text-2xl font-bold text-blue-600">40+</p>
              <p className="text-sm text-gray-600">Experts</p>
            </div>
            <div className="text-center p-2">
              <p className="text-2xl font-bold text-blue-600">60+</p>
              <p className="text-sm text-gray-600">Projects</p>
            </div>
            <div className="text-center p-2">
              <p className="text-2xl font-bold text-blue-600">80+</p>
              <p className="text-sm text-gray-600">Customers</p>
            </div>
            <div className="text-center p-2">
              <p className="text-2xl font-bold text-blue-600">10+</p>
              <p className="text-sm text-gray-600">Years</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}