import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
}

export function Homepage({ onJourneyClick }: HomepageProps) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJourneys();
  }, []);

  async function loadJourneys() {
    const { data, error } = await supabase
      .from('journeys')
      .select('*')
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-voya-gold/50 font-montserrat text-sm tracking-wider">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
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
}

function JourneyCard({ journey, nights, onClick }: JourneyCardProps) {
  const [experienceCount, setExperienceCount] = useState(0);

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
    <div
      onClick={onClick}
      className="bg-voya-card border border-voya-gold/20 p-8 cursor-pointer transition-all hover:border-voya-gold/60 hover:shadow-[0_0_30px_rgba(201,169,110,0.15)] group"
    >
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
  );
}
