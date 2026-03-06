import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const autoAdvanceTimer = setTimeout(() => {
      handleTransition();
    }, 6000);

    return () => clearTimeout(autoAdvanceTimer);
  }, []);

  const handleTransition = () => {
    setFadeOut(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('voyaIntroSeen', 'true');
      onComplete();
    }, 600);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-600 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#0C0A07' }}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="animate-pulse-glow"
          style={{
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(201, 169, 110, 0.08) 0%, transparent 70%)',
            animation: 'pulseGlow 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo Image */}
        <div
          className="animate-fade-in opacity-0"
          style={{ animationDelay: '0.3s' }}
        >
          <img
            src="/Voya_Logo.png"
            alt="Voya Logo"
            className="w-64 h-auto"
            style={{ filter: 'brightness(1.1)' }}
          />
        </div>

        {/* Divider line */}
        <div
          className="animate-grow-line opacity-0"
          style={{
            animationDelay: '1.2s',
            width: '40px',
            height: '1px',
            backgroundColor: '#C9A96E',
          }}
        />

        {/* Tagline */}
        <div
          className="animate-fade-up opacity-0"
          style={{
            animationDelay: '1.4s',
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '18px',
            color: '#C9A96E',
            letterSpacing: '2px',
          }}
        >
          Every experience, curated.
        </div>

        {/* CTA Button */}
        <button
          onClick={handleTransition}
          className="animate-fade-up opacity-0 transition-all duration-300 hover:bg-voya-gold hover:bg-opacity-10"
          style={{
            animationDelay: '1.8s',
            border: '1px solid #C9A96E',
            backgroundColor: 'transparent',
            fontFamily: 'Montserrat, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontSize: '11px',
            padding: '14px 40px',
            color: '#F0EAE0',
          }}
        >
          Begin Your Experience →
        </button>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.03;
            transform: scale(1);
          }
          50% {
            opacity: 0.08;
            transform: scale(1.1);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes growLine {
          0% {
            opacity: 0;
            width: 0;
          }
          100% {
            opacity: 1;
            width: 40px;
          }
        }

        .animate-fade-in {
          animation: fadeIn 1.2s ease-out forwards;
        }

        .animate-fade-up {
          animation: fadeUp 0.8s ease-out forwards;
        }

        .animate-grow-line {
          animation: growLine 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
