import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Calendar, Sparkles, FileText, Share2 } from 'lucide-react';
import { ShareJourneyModal } from './ShareJourneyModal';

interface Journey {
  id: string;
  title: string;
  destination: string;
  category: string;
  tagline: string;
  depart_date: string;
  return_date: string;
}

interface Day {
  id: string;
  journey_id: string;
  day_number: number;
  date: string;
}

interface Experience {
  id: string;
  day_id: string;
  time: string;
  title: string;
  category: string;
  concierge_details: string;
}

interface JourneyViewProps {
  journeyId: string;
  onBack: () => void;
  onAddExperience: (dayId: string) => void;
  onAISuggest: (dayId: string, destination: string) => void;
  onViewSummary: () => void;
}

const categoryColors: Record<string, string> = {
  dining: '#C9A96E',
  stay: '#A8B5C8',
  excursion: '#9CAF88',
  cultural: '#C4A8B5',
  wellness: '#A8C4C0',
  transport: '#B8A8C4',
  shopping: '#C9A96E',
};

export function JourneyView({ journeyId, onBack, onAddExperience, onAISuggest, onViewSummary }: JourneyViewProps) {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    loadJourney();
  }, [journeyId]);

  useEffect(() => {
    if (selectedDayId) {
      loadExperiences(selectedDayId);
    }
  }, [selectedDayId]);

  async function loadJourney() {
    const { data: journeyData } = await supabase
      .from('journeys')
      .select('*')
      .eq('id', journeyId)
      .maybeSingle();

    if (journeyData) {
      setJourney(journeyData);

      const { data: daysData } = await supabase
        .from('days')
        .select('*')
        .eq('journey_id', journeyId)
        .order('day_number', { ascending: true });

      if (daysData && daysData.length > 0) {
        setDays(daysData);
        setSelectedDayId(daysData[0].id);
      }
    }
    setLoading(false);
  }

  async function loadExperiences(dayId: string) {
    const { data } = await supabase
      .from('experiences')
      .select('*')
      .eq('day_id', dayId)
      .order('time', { ascending: true });

    setExperiences(data || []);
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
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  async function prepareTripData() {
    const allDaysData = await Promise.all(
      days.map(async (day) => {
        const { data: dayExperiences } = await supabase
          .from('experiences')
          .select('*')
          .eq('day_id', day.id)
          .order('time', { ascending: true });

        return {
          date: day.date,
          experiences: (dayExperiences || []).map(exp => ({
            time: exp.time,
            title: exp.title,
            type: exp.category,
            note: exp.concierge_details,
          })),
        };
      })
    );

    return {
      title: journey!.title,
      destination: journey!.destination,
      startDate: journey!.depart_date,
      endDate: journey!.return_date,
      days: allDaysData,
    };
  }

  if (loading || !journey) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-voya-gold/50 font-montserrat text-sm tracking-wider">Loading...</div>
      </div>
    );
  }

  const selectedDay = days.find(d => d.id === selectedDayId);
  const nights = calculateNights(journey.depart_date, journey.return_date);

  return (
    <div className="min-h-screen pt-20 flex">
      <aside className="w-[270px] border-r border-voya-gold/20 bg-voya-card/50 flex flex-col">
        <div className="p-8 border-b border-voya-gold/10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-voya-gold/60 hover:text-voya-gold transition-colors mb-6 font-montserrat text-sm"
          >
            <ArrowLeft size={16} />
            All Experiences
          </button>

          <h2 className="font-cormorant text-3xl font-light mb-2">{journey.title}</h2>
          <p className="text-voya-gold/60 font-montserrat text-xs tracking-wider mb-4">
            {journey.destination}
          </p>

          <div className="flex items-center gap-4 text-xs font-montserrat text-white/50 mb-6">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>{nights} nights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} />
              <span>{experiences.length} activities</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onViewSummary}
              className="w-full px-4 py-3 border border-voya-gold/40 text-voya-gold hover:bg-voya-gold/10 transition-all duration-300 font-montserrat uppercase flex items-center justify-center gap-2"
              style={{ fontSize: '9px', letterSpacing: '2px' }}
            >
              <FileText size={14} />
              View Summary →
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="w-full px-4 py-3 border border-voya-gold/40 text-voya-gold hover:bg-voya-gold/10 transition-all duration-300 font-montserrat uppercase flex items-center justify-center gap-2"
              style={{ fontSize: '9px', letterSpacing: '2px' }}
            >
              <Share2 size={14} />
              ⟶ Share Journey
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              className={`w-full text-left px-8 py-4 border-b border-voya-gold/10 transition-all ${
                selectedDayId === day.id
                  ? 'bg-voya-gold/5 border-l-2 border-l-voya-gold'
                  : 'hover:bg-voya-gold/5 border-l-2 border-l-transparent'
              }`}
            >
              <div className="font-montserrat text-xs text-voya-gold/50 mb-1">DAY {day.day_number}</div>
              <div className="font-montserrat text-sm text-white/80">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-16 py-12">
          {selectedDay && (
            <>
              <div className="flex items-start justify-between mb-12">
                <div>
                  <div className="font-montserrat text-xs text-voya-gold/50 tracking-wider uppercase mb-2">
                    Day {selectedDay.day_number}
                  </div>
                  <h3 className="font-cormorant text-5xl font-light">{formatDate(selectedDay.date)}</h3>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => onAISuggest(selectedDay.id, journey.destination)}
                    className="px-5 py-2.5 bg-transparent border border-[#C9A96E] text-[#C9A96E] font-montserrat uppercase hover:bg-voya-gold/10 transition-colors"
                    style={{ fontSize: '11px', letterSpacing: '2px' }}
                  >
                    ✦ Suggest with AI
                  </button>
                  <button
                    onClick={() => onAddExperience(selectedDay.id)}
                    className="flex items-center gap-2 px-5 py-2 bg-transparent border border-voya-gold text-voya-gold font-montserrat text-sm tracking-wider hover:bg-voya-gold/10 transition-colors"
                  >
                    <Plus size={14} />
                    Activity
                  </button>
                </div>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-voya-gold/30"></div>

                {experiences.length === 0 ? (
                  <div className="text-voya-gold/30 font-montserrat text-sm tracking-wider py-8">
                    No activities curated yet. Add your first activity above.
                  </div>
                ) : (
                  <div className="space-y-10">
                    {experiences.map((exp) => (
                      <ExperienceRow key={exp.id} experience={exp} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <ShareJourneyModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        tripData={journey && days.length > 0 ? prepareTripData : async () => ({
          title: '',
          destination: '',
          startDate: '',
          endDate: '',
          days: [],
        })}
      />
    </div>
  );
}

interface ExperienceRowProps {
  experience: Experience;
}

function ExperienceRow({ experience }: ExperienceRowProps) {
  const color = categoryColors[experience.category] || categoryColors.dining;

  return (
    <div className="relative">
      <div
        className="absolute -left-8 w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      ></div>

      <div className="flex gap-6">
        <div className="font-montserrat text-sm text-voya-gold/60 tracking-wider w-16 flex-shrink-0">
          {experience.time}
        </div>

        <div className="flex-1">
          <h4 className="font-cormorant text-2xl font-light mb-1">{experience.title}</h4>
          <div
            className="font-montserrat text-[9px] tracking-[0.15em] uppercase mb-3"
            style={{ color }}
          >
            {experience.category}
          </div>
          <p className="font-cormorant italic text-white/60 text-lg leading-relaxed">
            {experience.concierge_details}
          </p>
        </div>
      </div>
    </div>
  );
}
