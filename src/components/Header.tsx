import { Plus } from 'lucide-react';

interface HeaderProps {
  onNewJourney: () => void;
  buttonText?: string;
}

export function Header({ onNewJourney, buttonText = 'New Experience' }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-voya-black/90 backdrop-blur-sm border-b border-voya-gold/10">
      <div className="max-w-[1600px] mx-auto px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-montserrat font-light text-2xl tracking-[0.3em]">VOYA</span>
          <span className="w-1.5 h-1.5 bg-voya-gold rounded-full mt-2"></span>
        </div>

        <button
          onClick={onNewJourney}
          className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-voya-gold text-voya-gold font-montserrat text-sm tracking-wider hover:bg-voya-gold/10 transition-colors"
        >
          <Plus size={16} />
          {buttonText}
        </button>
      </div>
    </header>
  );
}
