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
import { upsertUserProfile } from './services/profileService';





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

  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
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
        // Profile missing – prompt creation
        console.warn('Profile missing, prompting creation');
        setShowProfilePrompt(true);
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

      {/* Profile creation prompt modal */}
      {showProfilePrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-[#1a1e2b] text-slate-200 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Create Profile</h2>
            <p className="mb-4">A user profile does not exist yet. Would you like to create one now?</p>
            <>
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-600 rounded"
                    onClick={() => {
                      setShowProfilePrompt(false);
                      setScreen('dashboard');
                    }}
                    disabled={savingProfile}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-indigo-600 rounded"
                    onClick={async () => {
                      if (!sessionData) return;
                      setSavingProfile(true);
                      try {
                        await upsertUserProfile(sessionData.user.id, sessionData.user.email);
                        setShowProfilePrompt(false);
                        const refreshed = await getUserProfile(sessionData.user.id);
                        setScreen('profile');
                      } catch (e: any) {
                        console.error('Failed to create profile', e);
                        setErrorMsg(e.message || 'Failed to create profile');
                      } finally {
                        setSavingProfile(false);
                      }
                    }}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
                {errorMsg && <p className="mt-2 text-sm text-red-500">{errorMsg}</p>}
            </>
          </div>
        </div>
      )}
    </div>
  );
}
