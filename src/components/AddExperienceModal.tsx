import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddExperienceModalProps {
  isOpen: boolean;
  dayId: string | null;
  onClose: () => void;
  onAdded: () => void;
}

const categories = [
  'dining',
  'stay',
  'excursion',
  'cultural',
  'wellness',
  'transport',
  'shopping',
];

export function AddExperienceModal({ isOpen, dayId, onClose, onAdded }: AddExperienceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    category: 'dining',
    conciergeDetails: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !dayId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('experiences').insert({
        day_id: dayId,
        title: formData.title,
        time: formData.time,
        category: formData.category,
        concierge_details: formData.conciergeDetails,
      });

      if (error) throw error;

      setFormData({
        title: '',
        time: '',
        category: 'dining',
        conciergeDetails: '',
      });
      onAdded();
    } catch (error) {
      console.error('Error adding experience:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-voya-card border border-voya-gold/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-voya-card border-b border-voya-gold/20 px-12 py-6 flex items-center justify-between">
          <h2 className="font-cormorant text-4xl font-light">Curate Experience</h2>
          <button
            onClick={onClose}
            className="text-voya-gold/60 hover:text-voya-gold transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          <div>
            <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
              Experience Name
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-voya-gold/30 focus:border-voya-gold outline-none pb-2 font-cormorant text-2xl text-white transition-colors"
              placeholder="e.g., Lunch at Scott's Mayfair"
            />
          </div>

          <div>
            <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
              Time
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-voya-gold/30 focus:border-voya-gold outline-none pb-2 font-montserrat text-xl text-white transition-colors"
            />
          </div>

          <div>
            <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-voya-gold/30 focus:border-voya-gold outline-none pb-2 font-montserrat text-lg text-white transition-colors capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-voya-card capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-montserrat text-xs text-voya-gold/60 tracking-wider uppercase mb-3">
              Concierge Details
            </label>
            <textarea
              required
              value={formData.conciergeDetails}
              onChange={(e) => setFormData({ ...formData, conciergeDetails: e.target.value })}
              rows={4}
              className="w-full bg-transparent border-0 border-b border-voya-gold/30 focus:border-voya-gold outline-none pb-2 font-cormorant italic text-lg text-white/80 transition-colors resize-none"
              placeholder="Add detailed notes, reservations, dress codes, insider tips..."
            />
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
              {loading ? 'Curating...' : 'Curate →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
