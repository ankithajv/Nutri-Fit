import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../lib/constants';

const FEATURE_HIGHLIGHTS = [
  {
    title: 'Instant Meal Parsing',
    description: 'Type everyday meals naturally and see macros in seconds.',
  },
  {
    title: '7-Day Habit Streaks',
    description: 'Build steady, sustainable routines without calorie obsession.',
  },
  {
    title: 'AI-Powered Food Swaps',
    description: 'Gentle, practical suggestions tailored to your plate.',
  },
];

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeQuote, setFadeQuote] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setFadeQuote(false);
      setTimeout(() => {
        setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        setFadeQuote(true);
      }, 250);
    }, 5200);

    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#202020] flex flex-col justify-between overflow-x-hidden">
      {/* ── Hero Section: Full-Width Food Photography (Upper ~50% Viewport) ── */}
      <section className="relative w-full h-[80vh] sm:h-[84vh] min-h-[380px] max-h-[580px] flex flex-col justify-between">
        {/* Background Food Photograph */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/vecteezy_healthy-food-on-a-dark-background_2032343.jpg')" }}
          aria-hidden="true"
        />

        {/* Top subtle scrim for navbar contrast */}
        <div
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 via-black/20 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Smooth white gradient fade towards the bottom into #FFFFFF */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/35 to-[#FFFFFF] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-44 sm:h-52 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/90 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* ── Fixed / Sticky Navigation Bar that moves down as user scrolls ── */}
        <header
          className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.06)] border-b border-gray-100 py-3 sm:py-3.5'
              : 'bg-transparent py-4 sm:py-5'
          }`}
        >
          <div className="w-full px-5 sm:px-10 lg:px-16 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-display font-bold text-[22px] sm:text-[24px] tracking-tight focus:outline-none drop-shadow-sm transition-transform hover:scale-[1.02]"
            >
              <span className={`transition-colors duration-200 ${isScrolled ? 'text-[#202020]' : 'text-[#FFFFFF]'}`}>
                Nutri
              </span>
              <span className="text-[#F28C38]">Fit</span>
            </button>

            <div className="flex items-center gap-3 sm:gap-5">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className={`text-[14px] sm:text-[15px] font-semibold transition-colors px-3 py-2 drop-shadow-sm ${
                  isScrolled
                    ? 'text-[#202020] hover:text-[#547A46]'
                    : 'text-[#FFFFFF] hover:text-[#F8F8F5]'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F28C38] hover:bg-[#df7b28] text-[#FFFFFF] text-[14px] font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(242,140,56,0.35)]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </header>

        {/* Top spacer in hero layout */}
        <div className="h-20" aria-hidden="true" />

        {/* ── Typography Overlay (Lower Portion of Hero Photo) ── */}
        <div className="relative z-10 w-full px-5 sm:px-8 pb-4 sm:pb-6 flex flex-col items-center text-center">
          <h1 className="stagger-1 font-display font-bold text-[38px] sm:text-[54px] lg:text-[64px] leading-[1.06] tracking-[-0.03em] text-[#202020]">
            Your Food,
            <br />
            Decoded By AI.
          </h1>

          <div className="stagger-2 mt-4 sm:mt-5">
            <p className="inline-block bg-[#202020] text-[#FFFFFF] px-4 py-1.5 sm:px-5 sm:py-2 font-serif text-[13px] sm:text-[15px] tracking-wide">
              Eat smarter | Understand better | Feel healthier
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="w-full px-4 sm:px-8 lg:px-12 pt-8 pb-16 sm:pt-10 sm:pb-24 flex-1 flex flex-col items-center">
        {/* ── Handwritten Motivational Quote ── */}
        <div className="stagger-3 w-full max-w-3xl mx-auto text-center min-h-[56px] flex items-center justify-center mb-10 sm:mb-14">
          <p
            className={`font-script text-[26px] sm:text-[34px] leading-snug text-[#547A46] transition-opacity duration-300 ${fadeQuote ? 'opacity-100' : 'opacity-0'
              }`}
          >
            &ldquo;{MOTIVATIONAL_QUOTES[quoteIndex]}&rdquo;
          </p>
        </div>

        {/* ── Feature Highlights (3 Columns Horizontally on Desktop & Mobile) ── */}
        <section
          aria-label="Key features"
          className="stagger-4 w-full max-w-5xl mx-auto grid grid-cols-3 gap-2.5 sm:gap-6"
        >
          {FEATURE_HIGHLIGHTS.map(feature => (
            <div
              key={feature.title}
              className="rounded-3xl bg-[#C2E9BF] px-3 py-5 sm:px-7 sm:py-8 text-center flex flex-col items-center justify-start transition-transform duration-300 hover:-translate-y-0.7"
            >
              <span className="w-6 h-0.5 rounded-full bg-[#547A46] mb-3 sm:mb-4" />
              <h2 className="font-feature font-semibold uppercase text-[11px] sm:text-[15px] lg:text-[16px] tracking-[0.06em] text-[#202020] leading-snug">
                {feature.title}
              </h2>
              <p className="mt-2 font-serif text-[11px] sm:text-[14px] leading-relaxed text-[#777777] hidden sm:block">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        {/* ── Call-to-Action Section ── */}
        <section className="stagger-5 w-full max-w-2xl mx-auto mt-14 sm:mt-20 text-center flex flex-col items-center">
          <img
            src="/heart-food.jpg"
            alt="Heart-shaped arrangement of fresh fruits and vegetables"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain mb-4 mix-blend-multiply select-none"
          />

          <h2 className="font-display font-bold text-[28px] sm:text-[36px] tracking-[-0.02em] leading-[1.15] text-[#202020]">
            Your healthier journey starts here.
          </h2>

          <p className="mt-3 font-serif text-[15px] sm:text-[17px] text-[#777777]">
            Small choices. Better habits. Smarter nutrition.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#F28C38] hover:bg-[#df7b28] text-[#FFFFFF] font-sans font-semibold text-[15px] transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-[#202020]/20 bg-[#FFFFFF] hover:bg-[#F8F8F5] text-[#202020] font-sans font-medium text-[15px] transition-all duration-200"
            >
              I already have an account
            </button>
          </div>
        </section>
      </main>

      {/* ── Minimal Footer ── */}
      <footer className="py-6 px-5 bg-[#F8F8F5] border-t border-[#202020]/5 text-center font-serif text-[13px] text-[#777777]">
        <p>NutriFit &bull; AI Nutrition Companion. Estimates for everyday guidance, not medical advice.</p>
      </footer>
    </div>
  );
};
