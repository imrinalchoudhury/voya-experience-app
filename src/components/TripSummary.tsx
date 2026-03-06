import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Journey {
  id: string;
  title: string;
  destination: string;
  depart_date: string;
  return_date: string;
}

interface Experience {
  id: string;
  day_id: string;
  title: string;
  category: string;
  time: string;
  concierge_details: string;
}

interface Day {
  id: string;
  journey_id: string;
  day_number: number;
  date: string;
}

interface TripSummaryProps {
  journeyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TripSummary({ journeyId, isOpen, onClose }: TripSummaryProps) {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, journeyId]);

  async function loadData() {
    setLoading(true);

    const { data: journeyData } = await supabase
      .from('journeys')
      .select('*')
      .eq('id', journeyId)
      .single();

    const { data: daysData } = await supabase
      .from('days')
      .select('*')
      .eq('journey_id', journeyId)
      .order('day_number');

    let allExperiences: Experience[] = [];
    if (daysData && daysData.length > 0) {
      const { data: experiencesData } = await supabase
        .from('experiences')
        .select('*')
        .in('day_id', daysData.map(d => d.id))
        .order('time');

      if (experiencesData) allExperiences = experiencesData;
    }

    if (journeyData) setJourney(journeyData);
    if (daysData) setDays(daysData);
    setExperiences(allExperiences);

    setLoading(false);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatDateShort(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  function calculateNights(departDate: string, returnDate: string): number {
    const depart = new Date(departDate + 'T00:00:00');
    const returnD = new Date(returnDate + 'T00:00:00');
    const diffTime = Math.abs(returnD.getTime() - depart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      dining: '#C9A96E',
      activity: '#8B9D83',
      culture: '#9B8B7E',
      relaxation: '#7E8B9B',
      adventure: '#A67C52',
      shopping: '#B8A090',
      nightlife: '#8B7E9B',
      transportation: '#7E8B83',
    };
    return colors[category.toLowerCase()] || '#C9A96E';
  }

  function formatTime(time: string): string {
    return time;
  }

  function handlePrint() {
    window.print();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center animate-fade-in print:bg-white" style={{ zIndex: 1000, backgroundColor: '#0C0A07' }}>
      {/* Close and Export buttons - hidden when printing */}
      <div className="absolute top-6 right-6 flex gap-3 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 border border-voya-gold text-voya-gold hover:bg-voya-gold hover:bg-opacity-10 transition-all duration-300 no-print"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          <Download size={14} />
          Export
        </button>
        <button
          onClick={onClose}
          className="text-voya-gold hover:text-voya-cream transition-colors no-print"
          aria-label="Close"
        >
          <X size={32} />
        </button>
      </div>

      {/* Summary Content */}
      <div
        className="trip-summary-content w-full max-w-[720px] max-h-[90vh] overflow-y-auto px-6 py-12 print:max-h-none print:overflow-visible print:py-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#C9A96E #0C0A07' }}
      >
        {loading || !journey ? (
          <div className="text-center text-voya-gold">Loading...</div>
        ) : (
          <div className="space-y-8 animate-fade-up">
            {/* Header Section */}
            <div className="space-y-4 pb-6 border-b border-voya-gold border-opacity-30">
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#C9A96E',
                }}
              >
                Experience Summary
              </div>

              <h1
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '48px',
                  fontWeight: 300,
                  lineHeight: '1.2',
                  color: '#F0EAE0',
                }}
                className="print:text-black"
              >
                {journey.title}
              </h1>

              <div
                className="flex items-center gap-3 text-voya-cream opacity-70 print:text-gray-600"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '13px',
                  letterSpacing: '1px',
                }}
              >
                <span>{journey.destination}</span>
                <span>•</span>
                <span>
                  {formatDate(journey.depart_date)} – {formatDate(journey.return_date)}
                </span>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <div
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '36px',
                      fontWeight: 300,
                      color: '#C9A96E',
                    }}
                    className="print:text-gray-800"
                  >
                    {calculateNights(journey.depart_date, journey.return_date)}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '11px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: '#C9A96E',
                      opacity: 0.7,
                    }}
                    className="print:text-gray-500"
                  >
                    Nights
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '36px',
                      fontWeight: 300,
                      color: '#C9A96E',
                    }}
                    className="print:text-gray-800"
                  >
                    {experiences.length}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '11px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: '#C9A96E',
                      opacity: 0.7,
                    }}
                    className="print:text-gray-500"
                  >
                    Experiences
                  </div>
                </div>
              </div>
            </div>

            {/* Day Sections */}
            <div className="space-y-8">
              {days.map((day, index) => {
                const dayExperiences = experiences.filter((exp) => exp.day_id === day.id);

                return (
                  <div
                    key={day.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Day Header */}
                    <div
                      className="mb-4"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '12px',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: '#C9A96E',
                      }}
                    >
                      Day {day.day_number} • {formatDateShort(day.date)}
                    </div>

                    {/* Day Experiences */}
                    <div
                      className="border-l border-voya-gold border-opacity-40 pl-6 space-y-6 print:border-gray-300"
                      style={{ marginLeft: '4px' }}
                    >
                      {dayExperiences.length === 0 ? (
                        <div
                          className="text-voya-gold opacity-40 italic print:text-gray-400"
                          style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: '16px',
                          }}
                        >
                          No activities planned
                        </div>
                      ) : (
                        dayExperiences.map((exp) => (
                          <div key={exp.id} className="space-y-2">
                            {/* Time */}
                            <div
                              style={{
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '11px',
                                letterSpacing: '1px',
                                color: '#C9A96E',
                              }}
                              className="print:text-gray-600"
                            >
                              {formatTime(exp.time)}
                            </div>

                            {/* Title */}
                            <div
                              style={{
                                fontFamily: 'Cormorant Garamond, serif',
                                fontSize: '22px',
                                fontWeight: 400,
                                color: '#F0EAE0',
                                lineHeight: '1.4',
                              }}
                              className="print:text-black"
                            >
                              {exp.title}
                            </div>

                            {/* Category */}
                            <div
                              style={{
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '10px',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                color: getCategoryColor(exp.category),
                              }}
                              className="print:text-gray-500"
                            >
                              {exp.category}
                            </div>

                            {/* Concierge Note */}
                            {exp.concierge_details && (
                              <div
                                style={{
                                  fontFamily: 'Cormorant Garamond, serif',
                                  fontSize: '16px',
                                  fontStyle: 'italic',
                                  color: '#C9A96E',
                                  opacity: 0.8,
                                  lineHeight: '1.6',
                                }}
                                className="print:text-gray-600"
                              >
                                {exp.concierge_details}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Divider between days */}
                    {index < days.length - 1 && (
                      <div
                        className="mt-8 border-t border-voya-gold border-opacity-20 print:border-gray-200"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-8 mt-8 border-t border-voya-gold border-opacity-30 text-center space-y-2 print:border-gray-300">
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#C9A96E',
                  opacity: 0.5,
                }}
                className="print:text-gray-400"
              >
                Curated by Voya
              </div>
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '14px',
                  letterSpacing: '8px',
                  color: '#C9A96E',
                  opacity: 0.3,
                }}
                className="print:text-gray-300"
              >
                VOYA·
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.6s ease-out forwards;
        }

        @media print {
          @page {
            margin: 0.75in;
          }

          body * {
            visibility: hidden;
          }

          .trip-summary-content,
          .trip-summary-content * {
            visibility: visible;
          }

          .trip-summary-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 40px;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
          }

          .no-print {
            display: none !important;
          }

          .animate-fade-up {
            opacity: 1 !important;
            animation: none !important;
          }

          /* Change gold accents to dark grey for print */
          .trip-summary-content [style*="color: #C9A96E"],
          .trip-summary-content [style*="color:#C9A96E"] {
            color: #333333 !important;
          }

          .trip-summary-content [style*="border-color: #C9A96E"],
          .trip-summary-content [style*="border-color:#C9A96E"] {
            border-color: #333333 !important;
          }

          /* Avoid breaking day sections across pages */
          .trip-summary-content > div > div:not(:first-child) {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
