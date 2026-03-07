import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else {
        setError(signInError.message);
      }
      return;
    }

    setLoading(false);
    onAuthSuccess();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      if (signUpError.message.includes('already registered')) {
        setError('Email already exists');
      } else {
        setError(signUpError.message);
      }
      return;
    }

    setLoading(false);
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      onAuthSuccess();
    }, 2000);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#0C0A07] flex items-center justify-center">
        <p className="text-[#C9A96E] text-2xl italic font-light tracking-wide">
          Welcome to Voya.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0A07] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#111009] border border-[rgba(201,169,110,0.2)] p-12">
        <h1 className="text-[#C9A96E] text-3xl font-light tracking-[0.3em] mb-8 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          VOYA
        </h1>

        <div className="flex gap-8 mb-8 justify-center">
          <button
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className="relative pb-2 text-[#C9A96E] opacity-60 hover:opacity-100 transition-opacity"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Sign In
            {mode === 'signin' && (
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C9A96E]" />
            )}
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className="relative pb-2 text-[#C9A96E] opacity-60 hover:opacity-100 transition-opacity"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Create Account
            {mode === 'signup' && (
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C9A96E]" />
            )}
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b border-[rgba(201,169,110,0.3)] text-[#C9A96E] placeholder-[rgba(201,169,110,0.4)] py-2 focus:outline-none focus:border-[#C9A96E] transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b border-[rgba(201,169,110,0.3)] text-[#C9A96E] placeholder-[rgba(201,169,110,0.4)] py-2 focus:outline-none focus:border-[#C9A96E] transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            </div>
            {error && (
              <p className="text-red-400 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A96E] text-[#0C0A07] py-3 font-medium tracking-wide hover:bg-[#d4b87e] transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {loading ? 'Signing In...' : 'Enter Voya →'}
            </button>
            <p className="text-center text-xs text-[rgba(201,169,110,0.6)] mt-4">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="hover:text-[#C9A96E] transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                New to Voya? Create Account
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-transparent border-b border-[rgba(201,169,110,0.3)] text-[#C9A96E] placeholder-[rgba(201,169,110,0.4)] py-2 focus:outline-none focus:border-[#C9A96E] transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b border-[rgba(201,169,110,0.3)] text-[#C9A96E] placeholder-[rgba(201,169,110,0.4)] py-2 focus:outline-none focus:border-[#C9A96E] transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b border-[rgba(201,169,110,0.3)] text-[#C9A96E] placeholder-[rgba(201,169,110,0.4)] py-2 focus:outline-none focus:border-[#C9A96E] transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            </div>
            {error && (
              <p className="text-red-400 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A96E] text-[#0C0A07] py-3 font-medium tracking-wide hover:bg-[#d4b87e] transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {loading ? 'Creating Account...' : 'Begin Your Journey →'}
            </button>
            <p className="text-center text-xs text-[rgba(201,169,110,0.6)] mt-4">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
                className="hover:text-[#C9A96E] transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Already a member? Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
