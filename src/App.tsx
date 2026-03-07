import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Homepage } from './components/Homepage';
import { JourneyView } from './components/JourneyView';
import { NewJourneyModal } from './components/NewJourneyModal';
import { AddExperienceModal } from './components/AddExperienceModal';
import { AISuggestModal } from './components/AISuggestModal';
import { SplashScreen } from './components/SplashScreen';
import { TripSummary } from './components/TripSummary';
import { AuthScreen } from './components/AuthScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataLoader } from './components/DataLoader';

function AppContent() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [view, setView] = useState<'home' | 'journey'>('home');
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
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
    if (!loading && !showSplash) {
      if (!user) {
        setShowAuth(true);
      } else {
        setShowAuth(false);
      }
    }
  }, [user, loading, showSplash]);

  function handleJourneyClick(journeyId: string) {
    setSelectedJourneyId(journeyId);
    setView('journey');
  }

  function handleBack() {
    setView('home');
    setSelectedJourneyId(null);
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

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : showAuth ? (
        <AuthScreen onAuthSuccess={() => setShowAuth(false)} />
      ) : (
        <DataLoader>
          <div className="min-h-screen bg-voya-black">
            <Header
              onNewJourney={() => setShowNewJourneyModal(true)}
              buttonText={view === 'journey' ? 'New Activity' : 'New Experience'}
            />

            {view === 'home' ? (
              <Homepage key={refreshKey} onJourneyClick={handleJourneyClick} />
            ) : selectedJourneyId ? (
              <JourneyView
                key={refreshKey}
                journeyId={selectedJourneyId}
                onBack={handleBack}
                onAddExperience={handleAddExperience}
                onAISuggest={handleAISuggest}
                onViewSummary={() => setShowTripSummary(true)}
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
        </DataLoader>
      )}
    </>
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
