import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import HeroBackground from "../components/HeroBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const openWidget = () => {
    // Trigger our widget to open
    if (window.RealEstateChat && window.RealEstateChat.toggle) {
      window.RealEstateChat.toggle();
    } else {
      console.log('Widget not ready yet, please wait...');
    }
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      {/* Hero Section */}
      <HeroBackground>
        {/* Main Content */}
        <div className="text-center px-6 max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Image
                src="/home_icon.png"
                alt="Real Estate Icon"
                width={48}
                height={48}
                className="filter brightness-0 invert"
              />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Find your
            <span className="text-primary-foreground block bg-primary/90 px-4 py-2 rounded-2xl backdrop-blur-sm">Perfect Property</span>
            
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Our intelligent assistant analyzes thousands of properties to find 
            exactly what you're looking for, in seconds.
          </p>

          {/* CTA Button */}
          <div className="mb-16">
            <button
              onClick={openWidget}
              className="group relative px-12 py-6 bg-primary text-primary-foreground text-xl font-semibold rounded-2xl hover:bg-primary/90 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary/25 backdrop-blur-sm border border-white/20"
            >
              <span className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Talk to Assistant
              </span>
              
              {/* Ripple Effect */}
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart AI</h3>
              <p className="text-white/80 text-sm">
                Advanced data analysis to find properties that meet your exact needs.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-accent/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fast Response</h3>
              <p className="text-white/80 text-sm">
                Get answers in seconds, not hours. Our AI works 24/7 for you.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-success/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Total Accuracy</h3>
              <p className="text-white/80 text-sm">
                Always updated data and accurate analysis to make the best decision.
              </p>
            </div>
          </div>
        </div>
      </HeroBackground>

      {/* How It Works Section */}
      <div className="py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Connect</h3>
              <p className="text-muted-foreground">
                Click the assistant button to start a conversation
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Describe</h3>
              <p className="text-muted-foreground">
                Tell us what you're looking for: location, price, features
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Analyze</h3>
              <p className="text-muted-foreground">
                Our AI analyzes thousands of properties in seconds
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                4
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Find</h3>
              <p className="text-muted-foreground">
                Receive the best personalized options for you
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Image
              src="/home_icon.png"
              alt="Real Estate Icon"
              width={32}
              height={32}
            />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Real Estate AI Agent
          </h3>
          <p className="text-muted-foreground mb-6">
            Transforming real estate search with artificial intelligence
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>© 2024 Real Estate AI</span>
            <span>•</span>
            <span>Privacy</span>
            <span>•</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
