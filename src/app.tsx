import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';
import TodayPage from '@/pages/TodayPage/TodayPage';
import LearningPage from '@/pages/LearningPage/LearningPage';
import LifePage from '@/pages/LifePage/LifePage';
import StatsPage from '@/pages/StatsPage/StatsPage';
import ProfilePage from '@/pages/ProfilePage/ProfilePage';
import WelcomeGuide from '@/pages/WelcomeGuide/WelcomeGuide';
import { getSettings } from '@/lib/storage';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [needsOnboarding, setNeedsOnboarding] = useState(() => {
    const settings = getSettings();
    return !settings.onboardingDone;
  });

  if (typeof window !== 'undefined') {
    (window as unknown as { __onboardingResolve?: () => void }).__onboardingResolve = () => {
      setNeedsOnboarding(false);
    };
  }

  if (needsOnboarding) return <WelcomeGuide />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/welcome" element={<WelcomeGuide />} />
        <Route
          element={
            <OnboardingGuard>
              <Layout />
            </OnboardingGuard>
          }
        >
          <Route index element={<TodayPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="life" element={<LifePage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
