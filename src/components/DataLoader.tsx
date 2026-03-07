import { useEffect, useState } from 'react';
import { loadSampleData } from '../scripts/loadSampleData';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function DataLoader({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initData = async () => {
      if (!user) {
        setLoaded(true);
        return;
      }

      const { data: journeys } = await supabase
        .from('journeys')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!journeys || journeys.length === 0) {
        await loadSampleData(user.id);
      }

      setLoaded(true);
    };

    initData();
  }, [user]);

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
