import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AISuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  onExperienceAdded: () => void;
  dayId: string;
}

interface SuggestedExperience {
  time: string;
  title: string;
  type: string;
  note: string;
}

const quickSuggestions = [
  'Michelin starred dinner',
  'Private cultural experience',
  'Sunrise excursion',
  'Luxury wellness & spa',
  'Private transfer or yacht',
];

const categoryColors: Record<string, string> = {
  dining: '#C9A96E',
  stay: '#A8B5C8',
  excursion: '#9CAF88',
  cultural: '#C4A8B5',
  wellness: '#A8C4C0',
  transport: '#B8A8C4',
  shopping: '#C9A96E',
};

export function AISuggestModal({ isOpen, onClose, destination, onExperienceAdded, dayId }: AISuggestModalProps) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedExperience[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit() {
    if (!inputText.trim()) return;

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const apiUrl = `${supabaseUrl}/functions/v1/suggest-experiences`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          request: inputText,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(`Error: ${errorData.error || 'API request failed'}`);
        } catch {
          setError(`API request failed with status ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      console.log('API response:', data);

      if (data.error) {
        console.error('Server error:', data);
        setError(`Error: ${data.error}${data.debug ? ' - ' + JSON.stringify(data.debug) : ''}`);
      } else {
        setSuggestions(data.experiences);
      }
    } catch (err) {
      setError('Our concierge is unavailable. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExperience(exp: SuggestedExperience) {
    await supabase.from('experiences').insert({
      day_id: dayId,
      time: exp.time,
      title: exp.title,
      category: exp.type,
      concierge_details: exp.note,
    });

    onExperienceAdded();
    handleClose();
  }

  function handleClose() {
    setInputText('');
    setSuggestions([]);
    setError('');
    setLoading(false);
    onClose();
  }

  function handleChipClick(text: string) {
    setInputText(text);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-voya-card border border-voya-gold/20 p-8">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-voya-gold/60 hover:text-voya-gold transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <h2 className="font-cormorant text-4xl font-light mb-2">AI Experience Suggester</h2>
          <p className="text-voya-gold/60 font-montserrat text-sm">
            Let our AI concierge curate bespoke experiences for {destination}
          </p>
        </div>

        {!suggestions.length && !loading && (
          <>
            <div className="mb-6">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Describe the experience you're looking for..."
                className="w-full bg-transparent border-b border-voya-gold/30 focus:border-voya-gold outline-none py-3 font-montserrat text-sm text-white placeholder:text-voya-gold/30 transition-colors"
              />
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleChipClick(suggestion)}
                  className="px-4 py-2 border border-voya-gold/40 text-voya-gold/70 hover:text-voya-gold hover:border-voya-gold font-montserrat text-xs tracking-wider transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!inputText.trim()}
              className="w-full py-3 bg-transparent border border-voya-gold text-voya-gold font-montserrat text-sm tracking-wider hover:bg-voya-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Conjure Experiences →
            </button>
          </>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-2 h-2 bg-voya-gold rounded-full animate-pulse mb-4"></div>
            <p className="font-montserrat text-sm text-voya-gold/70 tracking-wider">
              Your concierge is curating...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-voya-gold/50 font-montserrat text-sm">{error}</p>
            <button
              onClick={() => {
                setError('');
                setSuggestions([]);
              }}
              className="mt-4 px-6 py-2 border border-voya-gold text-voya-gold font-montserrat text-xs tracking-wider hover:bg-voya-gold/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-4">
            {suggestions.map((exp, index) => {
              const color = categoryColors[exp.type] || categoryColors.dining;
              return (
                <div
                  key={index}
                  className="bg-voya-black/40 border-l-2 p-6 hover:bg-voya-black/60 transition-colors"
                  style={{ borderLeftColor: color }}
                >
                  <div className="flex gap-6 items-start">
                    <div className="font-montserrat text-sm text-voya-gold/60 tracking-wider w-16 flex-shrink-0 pt-1">
                      {exp.time}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-cormorant text-2xl font-light mb-1">{exp.title}</h4>
                      <div
                        className="font-montserrat text-[9px] tracking-[0.15em] uppercase mb-3"
                        style={{ color }}
                      >
                        {exp.type}
                      </div>
                      <p className="font-cormorant italic text-white/60 text-base leading-relaxed mb-4">
                        {exp.note}
                      </p>
                      <button
                        onClick={() => handleAddExperience(exp)}
                        className="px-4 py-2 bg-transparent border border-voya-gold/40 text-voya-gold/70 hover:text-voya-gold hover:border-voya-gold hover:bg-voya-gold/10 font-montserrat text-xs tracking-wider transition-colors"
                      >
                        Add to Day →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              onClick={handleClose}
              className="w-full py-3 bg-transparent border border-voya-gold/40 text-voya-gold/70 hover:text-voya-gold hover:border-voya-gold font-montserrat text-sm tracking-wider transition-colors mt-4"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
