import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'journeys' | 'archive';
  onViewChange: (view: 'journeys' | 'archive') => void;
}

export function MobileMenu({ isOpen, onClose, currentView, onViewChange }: MobileMenuProps) {
  const { signOut } = useAuth();

  if (!isOpen) return null;

  function handleNavigation(view: 'journeys' | 'archive') {
    onViewChange(view);
    onClose();
  }

  function handleSignOut() {
    signOut();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-voya-dark animate-fadeIn">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 h-20 border-b border-voya-gold/20">
          <div className="flex items-center gap-1">
            <span className="font-montserrat font-light text-2xl tracking-[0.3em]">VOYA</span>
            <span className="w-1.5 h-1.5 bg-voya-gold rounded-full mt-2"></span>
          </div>
          <button
            onClick={onClose}
            className="text-voya-gold text-3xl leading-none hover:text-voya-gold/60 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
          <button
            onClick={() => handleNavigation('journeys')}
            className={`font-cormorant text-[28px] transition-all ${
              currentView === 'journeys'
                ? 'text-voya-gold'
                : 'text-voya-gold/60 hover:text-voya-gold'
            }`}
            style={{
              animation: 'menuItemFadeIn 0.4s ease-out 0.1s both',
            }}
          >
            Journeys
          </button>
          <button
            onClick={() => handleNavigation('archive')}
            className={`font-cormorant text-[28px] transition-all ${
              currentView === 'archive'
                ? 'text-voya-gold'
                : 'text-voya-gold/60 hover:text-voya-gold'
            }`}
            style={{
              animation: 'menuItemFadeIn 0.4s ease-out 0.2s both',
            }}
          >
            Archive
          </button>
          <button
            onClick={handleSignOut}
            className="font-cormorant text-[28px] text-voya-gold/60 hover:text-voya-gold transition-all"
            style={{
              animation: 'menuItemFadeIn 0.4s ease-out 0.3s both',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <style>{`
        @keyframes menuItemFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
