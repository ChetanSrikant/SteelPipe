"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative h-[500px] w-full">
      {/* Background Image with overlay */}
      <div className="absolute inset-0 bg-black/30 z-10" />
      <Image
        src="/forecasting-bg.jpg" // Replace with your actual image path
        alt="Forecasting Background"
        fill
        className="object-cover"
        priority
      />
      
      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Forecasting
        </h1>
        <p className="text-xl md:text-2xl text-white max-w-2xl">
          Steel Demand Forecasts, Anytime, Anywhere
        </p>
        
        {/* CTA Buttons */}
        
      </div>
    </section>
  );
}