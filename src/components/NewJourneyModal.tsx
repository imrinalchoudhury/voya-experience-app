import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DatePicker } from './DatePicker';

interface NewJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (journeyId: string) => void;
}

const destinations = [
  'Santorini',
  'Maldives',
  'Paris',
  'Amalfi Coast',
  'London',
  'Dubai',
];

const categories = [
  'Leisure',
  'Cultural',
  'Adventure',
  'Wellness',
  'Business',
  'Honeymoon',
];

export function NewJourneyModal({ isOpen, onClose, onCreated }: NewJourneyModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    tagline: '',
    departDate: '',
    returnDate: '',
    category: 'Leisure',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: journey, error: journeyError } = await supabase
        .from('journeys')
        .insert({
          title: formData.title,
          destination: formData.destination,
          category: formData.category,
          tagline: formData.tagline,
          depart_date: formData.departDate,
          return_date: formData.returnDate,
          user_id: user.id,
        })
        .select()
        .single();

      if (journeyError) throw journeyError;

      const departDate = new Date(formData.departDate);
      const returnDate = new Date(formData.returnDate);
      const diffTime = Math.abs(returnDate.getTime() - departDate.getTime());
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const daysToInsert = [];
      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(departDate);
        currentDate.setDate(currentDate.getDate() + i);
        daysToInsert.push({
          journey_id: journey.id,
          day_number: i + 1,
          date: currentDate.toISOString().split('T')[0],
        });
      }

      const { error: daysError } = await supabase
        .from('days')
        .insert(daysToInsert);

      if (daysError) throw daysError;

      onCreated(journey.id);
      setFormData({
        title: '',
        destination: '',
        tagline: '',
        departDate: '',
        returnDate: '',
        category: 'Leisure',
      });
    } catch (error) {
      console.error('Error creating journey:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-voya-card border border-voya-gold/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-voya-card border-b border-voya-gold/20 px-6 md:px-12 py-4 md:py-6 flex items-center justify-between">
          <h2 className="font-cormorant text-2xl md:text-4xl font-light">Begin New Experience</h2>
          <button
            onClick={onClose}
            className="text-voya-gold/60 hover:text-voya-gold transition-colors"
          >
            <X size={20} className="md:hidden" />
            <X size={24} className="hidden md:block" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-6 md:space-y-8">
          <div>
            <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
              Journey Title
            </label>
            <input
              type="text"
              required
              minLength={1}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-voya-gold/30 focus:border-voya-gold outline-none pb-2 font-cormorant text-2xl text-white transition-colors"
              placeholder="e.g., London Calling"
            />
          </div>

          <div>
            <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
              Destination
            </label>
            <input
              type="text"
              required
              minLength={1}
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-voya-gold/30 focus:border-voya-gold outline-none pb-2 font-cormorant text-2xl text-white transition-colors mb-4"
              placeholder="e.g., London, United Kingdom"
            />
            <div className="flex flex-wrap gap-2">
              {destinations.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setFormData({ ...formData, destination: dest })}
                  className="px-4 py-1.5 bg-transparent border border-voya-gold/20 text-voya-gold/60 hover:border-voya-gold/60 hover:text-voya-gold font-montserrat text-xs tracking-wider transition-colors"
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
              Tagline
            </label>
            <input
              type="text"
              required
              minLength={1}
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-voya-gold/30 focus:border-voya-gold outline-none pb-2 font-cormorant italic text-xl text-white transition-colors"
              placeholder="e.g., Heritage, haute cuisine & Mayfair elegance"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
                Departs
              </label>
              <DatePicker
                required
                value={formData.departDate}
                onChange={(value) => setFormData({ ...formData, departDate: value })}
                className="w-full bg-transparent border-0 border-b border-voya-gold/30 focus:border-voya-gold outline-none pb-2 font-montserrat text-white transition-colors cursor-pointer"
                placeholder="Select departure date"
              />
            </div>
            <div>
              <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
                Returns
              </label>
              <DatePicker
                required
                value={formData.returnDate}
                onChange={(value) => setFormData({ ...formData, returnDate: value })}
                className="w-full bg-transparent border-0 border-b border-voya-gold/30 focus:border-voya-gold outline-none pb-2 font-montserrat text-white transition-colors cursor-pointer"
                placeholder="Select return date"
              />
            </div>
          </div>

          <div>
            <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
              Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-4 py-2.5 border font-montserrat text-sm tracking-wider transition-colors ${
                    formData.category === cat
                      ? 'border-voya-gold text-voya-gold bg-voya-gold/5'
                      : 'border-voya-gold/20 text-voya-gold/60 hover:border-voya-gold/60 hover:text-voya-gold'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-transparent border border-voya-gold/20 text-voya-gold/60 hover:border-voya-gold/60 hover:text-voya-gold font-montserrat text-sm tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-voya-gold text-voya-gold hover:bg-voya-gold/10 font-montserrat text-sm tracking-wider transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Begin Experience'}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
