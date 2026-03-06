import { useEffect, useState } from 'react';
import { loadSampleData } from '../scripts/loadSampleData';

export function DataLoader({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const hasLoadedData = localStorage.getItem('voya_data_loaded');

      if (!hasLoadedData) {
        await loadSampleData();
        localStorage.setItem('voya_data_loaded', 'true');
      }

      setLoaded(true);
    };

    initData();
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-voya-black flex items-center justify-center">
        <div className="text-center">
          <div className="font-montserrat font-light text-2xl tracking-[0.3em] text-voya-gold mb-2">
            VOYA
          </div>
          <div className="text-voya-gold/50 font-montserrat text-sm tracking-wider">
            Preparing your experiences...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
