import Link from 'next/link';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import Overview from './components/Overview';
import Navbar from './components/Navbar';
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      {/* Hero Section */}
      <section className="text-center bg-gray-300 py-20">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Welcome to Innodatatics
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered solutions for your business.
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="https://innodatatics.ai/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Learn More
          </Link>
        </div>
      </section>


      <section id="overview">
        <Overview />
      </section>

      <section id="about">
        <AboutSection />
      </section>

      <section id="clients" className="relative h-[500px] w-full">
        <Image
          src="/clients.png"
          alt="clients"
          fill
          priority
        />
      </section>
    </div>
  );
}