import { useState } from 'react';
import { X, Send } from 'lucide-react';

interface TripData {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: Array<{
    date: string;
    experiences: Array<{
      time: string;
      title: string;
      type: string;
      note: string;
    }>;
  }>;
}

interface ShareJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripData: () => Promise<TripData>;
}

export function ShareJourneyModal({ isOpen, onClose, tripData }: ShareJourneyModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const trip = await tripData();

      const response = await fetch('https://mrin.app.n8n.cloud/webhook/voya-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: trip,
          recipientEmail: email,
        }),
      });

      if (!response.ok) throw new Error('Failed to send');

      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError('Failed to send itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center animate-fade-in"
      style={{ zIndex: 1000, backgroundColor: 'rgba(12, 10, 7, 0.9)' }}
    >
      <div className="bg-voya-card border border-voya-gold/20 w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-voya-gold/60 hover:text-voya-gold transition-colors"
        >
          <X size={20} />
        </button>

        <h2
          className="font-montserrat text-voya-gold mb-6"
          style={{
            fontSize: '14px',
            letterSpacing: '3px',
            textTransform: 'uppercase'
          }}
        >
          Share this Journey
        </h2>

        {success ? (
          <div
            className="text-center py-8 font-cormorant italic"
            style={{ color: '#C9A96E', fontSize: '18px' }}
          >
            Your itinerary has been dispatched. ✦
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Travel companion's email"
                required
                disabled={loading}
                className="w-full bg-transparent border-b-2 border-voya-gold/40 focus:border-voya-gold outline-none py-2 text-white/90 placeholder-white/30 font-montserrat text-sm transition-colors"
                style={{ letterSpacing: '0.5px' }}
              />
            </div>

            {error && (
              <div className="text-red-400 font-montserrat text-xs">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full px-5 py-3 border border-voya-gold text-voya-gold hover:bg-voya-gold/10 transition-all duration-300 font-montserrat uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontSize: '11px', letterSpacing: '2px' }}
            >
              <Send size={14} />
              {loading ? 'Sending...' : 'Send Itinerary →'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
