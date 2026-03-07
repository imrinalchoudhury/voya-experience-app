import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Sparkles } from 'lucide-react';

interface Journey {
  id: string;
  title: string;
  destination: string;
  category: string;
  tagline: string;
  depart_date: string;
  return_date: string;
}

interface HomepageProps {
  onJourneyClick: (journeyId: string) => void;
  onJourneysChange?: () => void;
}

export function Homepage({ onJourneyClick, onJourneysChange }: HomepageProps) {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingJourneyId, setCompletingJourneyId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      loadJourneys();
    }
  }, [user]);

  async function loadJourneys() {
    if (!user) return;

    const { data, error } = await supabase
      .from('journeys')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('depart_date', { ascending: true });

    if (error) {
      console.error('Error loading journeys:', error);
    } else {
      setJourneys(data || []);
    }
    setLoading(false);
  }

  function calculateNights(departDate: string, returnDate: string): number {
    const depart = new Date(departDate);
    const returnD = new Date(returnDate);
    const diffTime = Math.abs(returnD.getTime() - depart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  async function markAsCompleted(journeyId: string) {
    setCompletingJourneyId(journeyId);
    try {
      const { error } = await supabase
        .from('journeys')
        .update({ completed: true })
        .eq('id', journeyId);

      if (error) throw error;

      setJourneys(prev => prev.filter(j => j.id !== journeyId));
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);

      if (onJourneysChange) {
        onJourneysChange();
      }
    } catch (error) {
      console.error('Error marking journey as completed:', error);
    } finally {
      setCompletingJourneyId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-voya-gold/50 font-montserrat text-sm tracking-wider">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {showConfirmation && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-voya-card border border-voya-gold/30 px-8 py-4 animate-fadeIn">
          <p className="font-cormorant italic text-voya-gold text-xl">
            Journey archived. ✦
          </p>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-12 py-20">
        <div className="mb-24">
          <div className="text-voya-gold/60 font-montserrat text-[10px] tracking-[0.3em] uppercase mb-6">
            LUXURY TRAVEL PLANNER
          </div>
          <h1 className="font-cormorant text-7xl font-light leading-tight">
            Every experience,<br />
            <span className="italic text-voya-gold">curated.</span>
          </h1>
        </div>

        {journeys.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-voya-gold/30 font-montserrat text-sm tracking-wider">
              No experiences yet. Begin your first experience above.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {journeys.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                nights={calculateNights(journey.depart_date, journey.return_date)}
                onClick={() => onJourneyClick(journey.id)}
                onMarkCompleted={() => markAsCompleted(journey.id)}
                isCompleting={completingJourneyId === journey.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface JourneyCardProps {
  journey: Journey;
  nights: number;
  onClick: () => void;
  onMarkCompleted: () => void;
  isCompleting: boolean;
}

function JourneyCard({ journey, nights, onClick, onMarkCompleted, isCompleting }: JourneyCardProps) {
  const [experienceCount, setExperienceCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    async function loadExperienceCount() {
      const { data: days } = await supabase
        .from('days')
        .select('id')
        .eq('journey_id', journey.id);

      if (days) {
        const dayIds = days.map(d => d.id);
        if (dayIds.length > 0) {
          const { count } = await supabase
            .from('experiences')
            .select('*', { count: 'exact', head: true })
            .in('day_id', dayIds);
          setExperienceCount(count || 0);
        }
      }
    }
    loadExperienceCount();
  }, [journey.id]);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="relative bg-voya-card border border-voya-gold/20 p-8 transition-all hover:border-voya-gold/60 hover:shadow-[0_0_30px_rgba(201,169,110,0.15)] group">
      <div
        className="absolute top-6 right-6"
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="text-voya-gold/30 hover:text-voya-gold/60 transition-colors text-xl leading-none"
        >
          ⋯
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full mt-2 bg-[#111009] border border-voya-gold/20 min-w-[160px] z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkCompleted();
                setShowMenu(false);
              }}
              disabled={isCompleting}
              className="w-full px-4 py-2.5 text-voya-gold/80 hover:text-voya-gold hover:bg-voya-gold/5 font-montserrat text-xs tracking-wide text-left transition-colors disabled:opacity-50"
            >
              {isCompleting ? 'Archiving...' : 'Mark as Completed'}
            </button>
          </div>
        )}
      </div>

      <div onClick={onClick} className="cursor-pointer">
        <div className="flex items-start gap-2 mb-4 text-voya-gold/50 font-montserrat text-[10px] tracking-[0.2em] uppercase">
          <MapPin size={12} className="mt-0.5" />
          <span>{journey.destination}</span>
        </div>

      <h3 className="font-cormorant text-3xl font-light mb-2 group-hover:text-voya-gold transition-colors">
        {journey.title}
      </h3>

      <p className="font-cormorant italic text-voya-gold/70 text-lg mb-6">
        {journey.tagline}
      </p>

      <div className="flex items-center gap-6 text-sm font-montserrat text-white/60">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{nights} nights</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={14} />
          <span>{experienceCount} activities</span>
        </div>
      </div>

        <div className="mt-6 pt-6 border-t border-voya-gold/10 text-xs font-montserrat text-voya-gold/50 tracking-wider">
          Departs {formatDate(journey.depart_date)}
        </div>
      </div>
    </div>
  );
}
