import React from "react";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import OnboardingScreen from "./components/OnboardingScreen";
import AuthScreen from "./components/AuthScreen";
import LevelSelectionScreen from "./components/LevelSelectionScreen";
import DashboardScreen from "./components/DashboardScreen";
import AISolverScreen from "./components/AISolverScreen";
import PracticeScreen from "./components/PracticeScreen";
import ProfileScreen from "./components/ProfileScreen";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { supabase } from "./lib/supabase";
import { getUserProfile, getLearningPreferences } from "./services/profileService";
import { UserState, MathLevel } from "./types";
import { initialiseCloudSync } from './services/cloudSyncService';






export default function App() {
  const [screen, setScreen] = useState<
    "onboarding" | "auth" | "level-selection" | "dashboard" | "solver" | "practice" | "profile" | "analytics"
  >("onboarding");

  const [userState, setUserState] = useState<UserState>(() => {
    const cached = localStorage.getItem("mathverse_user");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached user settings:", e);
      }
    }
    return {
      email: null,
      currentLevel: null,
      onboarded: false,
      score: 100,
      solvedProblems: 0,
    };
  });


  const [sessionData, setSessionData] = useState<any>(null);
  const [selectedPracticeTopic, setSelectedPracticeTopic] = useState<string | undefined>(undefined);

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem("mathverse_user", JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
    if (userState.onboarded && screen === "onboarding") {
      setScreen("dashboard");
    }
  }, [userState.onboarded, screen]);

  // Offline detection state
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Render an offline banner at top when offline
  const OfflineBanner = () => (
    <div className="bg-red-900 text-white text-center py-2 font-mono text-sm">
      MathVerse cannot reach the backend (Supabase). Check your internet connection or Supabase URL.
    </div>
  );

  // Listen for Supabase auth state changes
  useEffect(() => {
    const handleSession = async (session: any) => {
      // Handle OAuth or Email Link errors in URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      const errorDesc = hashParams.get("error_description") || queryParams.get("error_description");
      
      if (errorDesc) {
        console.error("Auth callback error:", errorDesc);
      }

      if (!session) {
        // Not logged in
        if (screen !== "onboarding" && screen !== "auth") {
          setScreen("onboarding");
        }
        return;
      }

      setSessionData(session);

      // User is verified (no email confirmation check required)
      let avatarUrl: string | undefined;
      let modePref: any = 'detailed';
      
      try {
        const profileData = await getUserProfile(session.user.id);
        avatarUrl = profileData.avatar_url;
      } catch (profileErr) {
        // Profile missing – auto-create silently
        console.warn('Profile missing, creating automatically');
        try {
          await supabase.from('profiles').upsert({
            id: session.user.id,
            email: session.user.email,
            username: session.user.email?.split('@')[0] || null,
            selected_theme: 'dark',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          const refreshed = await getUserProfile(session.user.id);
          avatarUrl = refreshed.avatar_url;
        } catch (e) {
          console.error('Failed to auto-create profile', e);
        }
      }

      // Automatically check & create learning_preferences if missing
      try {
        await supabase.from('learning_preferences').upsert({
          user_id: session.user.id,
          learning_mode: 'simple',
          font_size: 'medium',
          accessibility_mode: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' }); // Handle existing user entry safely
      } catch (prefErr) {
        console.error('Failed to auto-create learning preferences:', prefErr);
      }

      try {
        const prefData = await getLearningPreferences(session.user.id);
        modePref = prefData.mode;
      } catch (prefErr) {
        console.error('Failed to load learning preferences:', prefErr);
      }

      setUserState((prev) => ({
        ...prev,
        id: session.user.id,
        email: session.user.email,
        avatar_url: avatarUrl || prev.avatar_url,
        learningMode: modePref || prev.learningMode || 'detailed'
      }));
      // Initialise cloud sync for this user
      if (session) {
        initialiseCloudSync(session.user.id);
        setSessionData(session);
      }
      
      // Clear hash/query redirect params if they are set
      if (window.location.pathname === '/auth/callback' || hashParams.has("access_token")) {
        window.history.replaceState({}, document.title, "/");
      }

      // Navigate to appropriate screen if they just logged in
      if (screen === "auth" || screen === "onboarding") {
        if (userState.onboarded && userState.currentLevel) {
          setScreen("dashboard");
        } else {
          setScreen("level-selection");
        }
      }
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [screen, userState.onboarded, userState.currentLevel]);

  const handleStartOnboarding = () => {
    setScreen("auth");
  };

  const handleAlreadyHaveAccount = () => {
    setScreen("auth");
  };

  const handleAuthSuccess = (email: string) => {
    setUserState((prev) => ({
      ...prev,
      email,
    }));
    setScreen("level-selection");
  };

  const handleLevelSelect = (level: MathLevel) => {
    setUserState((prev) => ({
      ...prev,
      currentLevel: level,
      onboarded: true,
    }));
    setScreen("dashboard");
  };

  const handleIncrementSolved = () => {
    setUserState((prev) => ({
      ...prev,
      solvedProblems: prev.solvedProblems + 1,
      score: prev.score + 15,
    }));
  };

  const handleAddScore = (pointsCount: number) => {
    setUserState((prev) => ({
      ...prev,
      score: prev.score + pointsCount,
    }));
  };

  const handleAvatarChange = (url: string) => {
    setUserState((prev) => ({ ...prev, avatar_url: url }));
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setUserState({
      email: null,
      currentLevel: null,
      onboarded: false,
      score: 100,
      solvedProblems: 0,
    });
    localStorage.removeItem("mathverse_user");
    setScreen("onboarding");
  };

  const handleUpdateEmail = (newEmail: string) => {
    setUserState((prev) => ({
      ...prev,
      email: newEmail,
    }));
  };

  const handlePracticeRedirect = (selectedTopic?: string) => {
    setSelectedPracticeTopic(selectedTopic);
    setScreen("practice");
  };

  return (
    <div className="bg-[#0f131f] text-slate-200 min-h-screen">
      {screen === "onboarding" && (
        <OnboardingScreen
          onStart={handleStartOnboarding}
          onAlreadyHaveAccount={handleAlreadyHaveAccount}
        />
      )}

      {screen === "auth" && (
        <AuthScreen
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setScreen("onboarding")}
        />
      )}

      {screen === "level-selection" && (
        <LevelSelectionScreen
          onLevelSelect={handleLevelSelect}
          onBack={() => setScreen("auth")}
        />
      )}

      {screen === "dashboard" && (
        <DashboardScreen
          userState={userState}
          onSolveRedirect={() => setScreen("solver")}
          onPracticeRedirect={handlePracticeRedirect}
          onProfileRedirect={() => setScreen("profile")}
          onChangeLevelRedirect={() => setScreen("level-selection")}
          onDiagnosticsRedirect={() => setScreen("analytics")}
          onLogOut={handleLogOut}
          onAvatarChange={handleAvatarChange}
        />
      )}

      {screen === "analytics" && (
        <AnalyticsDashboard
          userId={userState.id || ""}
          onBack={() => setScreen("dashboard")}
        />
      )}

      {screen === "solver" && (
        <AISolverScreen
          userState={userState}
          onBack={() => setScreen("dashboard")}
          onIncrementSolved={handleIncrementSolved}
        />
      )}

      {screen === "practice" && (
        <PracticeScreen
          userState={userState}
          selectedTopic={selectedPracticeTopic}
          onBack={() => setScreen("dashboard")}
          onAddScore={handleAddScore}
        />
      )}

      {screen === "profile" && (
        <ProfileScreen
          userState={userState}
          onBack={() => setScreen("dashboard")}
          onChangeLevel={() => setScreen("level-selection")}
          onLogOut={handleLogOut}
          onUpdateEmail={handleUpdateEmail}
          onAvatarChange={handleAvatarChange}
          onLearningModeChange={(mode) => setUserState(prev => ({ ...prev, learningMode: mode }))}
        />
      )}


    </div>
  );
}
