import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Homepage } from './components/Homepage';
import { Archive } from './components/Archive';
import { JourneyView } from './components/JourneyView';
import { NewJourneyModal } from './components/NewJourneyModal';
import { AddExperienceModal } from './components/AddExperienceModal';
import { AISuggestModal } from './components/AISuggestModal';
import { SplashScreen } from './components/SplashScreen';
import { TripSummary } from './components/TripSummary';
import { AuthScreen } from './components/AuthScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { loadSampleData } from './scripts/loadSampleData';

function AppContent() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [view, setView] = useState<'home' | 'archive' | 'journey'>('home');
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [isArchivedJourney, setIsArchivedJourney] = useState(false);
  const [showNewJourneyModal, setShowNewJourneyModal] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showAISuggestModal, setShowAISuggestModal] = useState(false);
  const [showTripSummary, setShowTripSummary] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedJourneyDestination, setSelectedJourneyDestination] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('voyaIntroSeen');
    if (hasSeenIntro) {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      if (loading || showSplash) return;

      if (!user) {
        setShowAuth(true);
        setDataLoaded(true);
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

      setShowAuth(false);
      setDataLoaded(true);
    };

    initData();
  }, [user, loading, showSplash]);

  function handleJourneyClick(journeyId: string, isArchived = false) {
    setSelectedJourneyId(journeyId);
    setIsArchivedJourney(isArchived);
    setView('journey');
  }

  function handleBack() {
    const targetView = isArchivedJourney ? 'archive' : 'home';
    setView(targetView);
    setSelectedJourneyId(null);
    setIsArchivedJourney(false);
    setRefreshKey(prev => prev + 1);
  }

  function handleViewChange(newView: 'journeys' | 'archive') {
    setView(newView === 'journeys' ? 'home' : 'archive');
    setRefreshKey(prev => prev + 1);
  }

  function handleNewJourneyCreated(journeyId: string) {
    setShowNewJourneyModal(false);
    setSelectedJourneyId(journeyId);
    setView('journey');
    setRefreshKey(prev => prev + 1);
  }

  function handleAddExperience(dayId: string) {
    setSelectedDayId(dayId);
    setShowAddExperienceModal(true);
  }

  function handleAISuggest(dayId: string, destination: string) {
    setSelectedDayId(dayId);
    setSelectedJourneyDestination(destination);
    setShowAISuggestModal(true);
  }

  function handleExperienceAdded() {
    setShowAddExperienceModal(false);
    setRefreshKey(prev => prev + 1);
  }

  function handleAISuggestComplete() {
    setShowAISuggestModal(false);
    setRefreshKey(prev => prev + 1);
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!dataLoaded || loading) {
    return <div className="min-h-screen bg-voya-black" />;
  }

  if (showAuth) {
    return <AuthScreen onAuthSuccess={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-voya-black">
      <Header
        onNewJourney={() => setShowNewJourneyModal(true)}
        buttonText={view === 'journey' ? 'New Activity' : 'New Experience'}
        currentView={view === 'home' ? 'journeys' : view === 'archive' ? 'archive' : undefined}
        onViewChange={view !== 'journey' ? handleViewChange : undefined}
      />

      {view === 'home' ? (
        <Homepage
          key={refreshKey}
          onJourneyClick={(id) => handleJourneyClick(id, false)}
          onJourneysChange={() => setRefreshKey(prev => prev + 1)}
          onNewJourney={() => setShowNewJourneyModal(true)}
        />
      ) : view === 'archive' ? (
        <Archive
          key={refreshKey}
          onJourneySelect={(id) => handleJourneyClick(id, true)}
        />
      ) : selectedJourneyId ? (
        <JourneyView
          key={refreshKey}
          journeyId={selectedJourneyId}
          onBack={handleBack}
          onAddExperience={handleAddExperience}
          onAISuggest={handleAISuggest}
          onViewSummary={() => setShowTripSummary(true)}
          isReadOnly={isArchivedJourney}
        />
      ) : null}

      <NewJourneyModal
        isOpen={showNewJourneyModal}
        onClose={() => setShowNewJourneyModal(false)}
        onCreated={handleNewJourneyCreated}
      />

      <AddExperienceModal
        isOpen={showAddExperienceModal}
        dayId={selectedDayId}
        onClose={() => setShowAddExperienceModal(false)}
        onAdded={handleExperienceAdded}
      />

      <AISuggestModal
        isOpen={showAISuggestModal}
        dayId={selectedDayId || ''}
        destination={selectedJourneyDestination}
        onClose={() => setShowAISuggestModal(false)}
        onExperienceAdded={handleAISuggestComplete}
      />

      {selectedJourneyId && (
        <TripSummary
          journeyId={selectedJourneyId}
          isOpen={showTripSummary}
          onClose={() => setShowTripSummary(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
