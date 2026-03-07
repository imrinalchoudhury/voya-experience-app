import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNewJourney: () => void;
  buttonText?: string;
  currentView?: 'journeys' | 'archive';
  onViewChange?: (view: 'journeys' | 'archive') => void;
}

export function Header({ onNewJourney, buttonText = 'New Experience', currentView = 'journeys', onViewChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getUserDisplayName = () => {
    if (!user) return '';

    const fullName = user.user_metadata?.full_name;
    if (fullName) {
      return fullName.split(' ')[0];
    }

    return user.email?.split('@')[0] || '';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-voya-black/90 backdrop-blur-sm border-b border-voya-gold/10">
      <div className="max-w-[1600px] mx-auto px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-1">
            <span className="font-montserrat font-light text-2xl tracking-[0.3em]">VOYA</span>
            <span className="w-1.5 h-1.5 bg-voya-gold rounded-full mt-2"></span>
          </div>

          {onViewChange && (
            <div className="flex items-center gap-8">
              <button
                onClick={() => onViewChange('journeys')}
                className={`font-montserrat text-[9px] tracking-[3px] uppercase transition-all pb-1 border-b-2 ${
                  currentView === 'journeys'
                    ? 'text-voya-gold border-voya-gold'
                    : 'text-voya-gold/40 border-transparent hover:text-voya-gold/60'
                }`}
              >
                Journeys
              </button>
              <button
                onClick={() => onViewChange('archive')}
                className={`font-montserrat text-[9px] tracking-[3px] uppercase transition-all pb-1 border-b-2 ${
                  currentView === 'archive'
                    ? 'text-voya-gold border-voya-gold'
                    : 'text-voya-gold/40 border-transparent hover:text-voya-gold/60'
                }`}
              >
                Archive
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onNewJourney}
            className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-voya-gold text-voya-gold font-montserrat text-sm tracking-wider hover:bg-voya-gold/10 transition-colors"
          >
            <Plus size={16} />
            {buttonText}
          </button>

          {user && (
            <div
              className="relative"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <button className="text-voya-gold/60 hover:text-voya-gold font-montserrat text-xs tracking-wide transition-colors">
                {getUserDisplayName()}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full bg-[#111009] border border-voya-gold/20 min-w-[120px] pt-1">
                  <button
                    onClick={signOut}
                    className="w-full px-4 py-2 text-voya-gold/80 hover:text-voya-gold hover:bg-voya-gold/5 font-montserrat text-xs tracking-wide text-left transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
