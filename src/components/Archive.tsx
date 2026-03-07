import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Journey = Database['public']['Tables']['journeys']['Row'];

interface ArchiveProps {
  onJourneySelect: (journeyId: string) => void;
}

export function Archive({ onJourneySelect }: ArchiveProps) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [experienceCounts, setExperienceCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCompletedJourneys();
  }, []);

  async function loadCompletedJourneys() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: journeysData, error: journeysError } = await supabase
        .from('journeys')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('return_date', { ascending: false });

      if (journeysError) throw journeysError;

      setJourneys(journeysData || []);

      if (journeysData && journeysData.length > 0) {
        const journeyIds = journeysData.map(j => j.id);
        const { data: experiencesData } = await supabase
          .from('experiences')
          .select('id, day_id, days!inner(journey_id)')
          .in('days.journey_id', journeyIds);

        const counts: Record<string, number> = {};
        journeyIds.forEach(id => counts[id] = 0);

        experiencesData?.forEach((exp: any) => {
          const journeyId = exp.days.journey_id;
          counts[journeyId] = (counts[journeyId] || 0) + 1;
        });

        setExperienceCounts(counts);
      }
    } catch (error) {
      console.error('Error loading completed journeys:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDateRange(depart: string, returnDate: string) {
    const departDate = new Date(depart);
    const endDate = new Date(returnDate);
    const departMonth = departDate.toLocaleDateString('en-US', { month: 'short' });
    const returnMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const departDay = departDate.getDate();
    const returnDay = endDate.getDate();
    const year = endDate.getFullYear();

    if (departMonth === returnMonth) {
      return `${departMonth} ${departDay}–${returnDay}, ${year}`;
    }
    return `${departMonth} ${departDay} – ${returnMonth} ${returnDay}, ${year}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-voya-dark pt-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-voya-gold/40 font-montserrat text-sm tracking-widest">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-voya-dark pt-24 md:pt-32 px-4 md:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-16 text-center">
          <div className="font-montserrat text-voya-gold/60 text-[9px] tracking-[3px] uppercase mb-4 md:mb-6">
            Travel Memoir
          </div>
          <h1 className="font-cormorant text-4xl md:text-[64px] leading-[1.1] font-light">
            Your story,
            <br />
            <span className="italic text-voya-gold">so far.</span>
          </h1>
        </div>

        {journeys.length === 0 ? (
          <div className="text-center py-16 md:py-24 px-4">
            <p className="font-cormorant text-2xl md:text-3xl font-light text-voya-gold/40 mb-3">
              No completed journeys yet.
            </p>
            <p className="font-cormorant text-lg md:text-xl font-light text-voya-gold/30">
              Your finest chapters will live here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {journeys.map((journey, index) => (
              <div
                key={journey.id}
                onClick={() => onJourneySelect(journey.id)}
                className="group relative bg-voya-card border border-voya-gold/20 p-6 md:p-8 cursor-pointer transition-all duration-500 hover:border-voya-gold/60 opacity-85 hover:opacity-100"
                style={{
                  animation: `fadeUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="absolute top-3 md:top-4 right-3 md:right-4">
                  <div className="font-montserrat text-[7px] md:text-[8px] tracking-[2px] text-voya-gold/30 uppercase">
                    Completed
                  </div>
                </div>

                <div className="mb-4 md:mb-6">
                  <div className="font-montserrat text-[8px] md:text-[9px] tracking-[3px] text-voya-gold/40 uppercase mb-2">
                    {journey.category}
                  </div>
                  <h2 className="font-cormorant text-2xl md:text-3xl font-light text-white mb-2 group-hover:text-voya-gold transition-colors">
                    {journey.title}
                  </h2>
                  <p className="font-cormorant text-lg md:text-xl italic text-voya-gold/60 mb-3 md:mb-4">
                    {journey.tagline}
                  </p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-voya-gold/20 to-transparent mb-4 md:mb-6"></div>

                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-montserrat text-[8px] md:text-[9px] tracking-[2px] text-voya-gold/40 uppercase">
                      Destination
                    </span>
                    <span className="font-montserrat text-xs md:text-sm text-voya-gold/60">
                      {journey.destination}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-montserrat text-[8px] md:text-[9px] tracking-[2px] text-voya-gold/40 uppercase">
                      Dates
                    </span>
                    <span className="font-montserrat text-xs md:text-sm text-voya-gold/60">
                      {formatDateRange(journey.depart_date, journey.return_date)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-montserrat text-[8px] md:text-[9px] tracking-[2px] text-voya-gold/40 uppercase">
                      Experiences
                    </span>
                    <span className="font-montserrat text-xs md:text-sm text-voya-gold/60">
                      {experienceCounts[journey.id] || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 0.85;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
