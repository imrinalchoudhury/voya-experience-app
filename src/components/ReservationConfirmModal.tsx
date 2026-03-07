import { X } from 'lucide-react';

interface ReservationConfirmModalProps {
  journeyTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReservationConfirmModal({ journeyTitle, onConfirm, onCancel }: ReservationConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111009] rounded-2xl p-8 max-w-md w-full border border-[rgba(201,169,110,0.3)] relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[#C9A96E] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-[#C9A96E] mb-6" style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 400 }}>
          Confirm Reservation
        </h2>

        <p className="text-[#E5E5E5] mb-8" style={{ fontFamily: 'Cormorant Garamond', fontSize: '16px', lineHeight: '1.6' }}>
          Are you sure you want to reserve <span className="text-[#C9A96E]">{journeyTitle}</span>? A confirmation will be sent to your email.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#C9A96E] text-[#0C0A07] py-3 rounded-lg hover:bg-[#D4B574] transition-all"
            style={{ fontFamily: 'Montserrat', fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            Confirm →
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-transparent text-[#C9A96E] py-3 rounded-lg border border-[#C9A96E] hover:bg-[rgba(201,169,110,0.1)] transition-all"
            style={{ fontFamily: 'Montserrat', fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
