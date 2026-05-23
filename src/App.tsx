import { useState, useEffect } from "react";
import OnboardingScreen from "./components/OnboardingScreen";
import AuthScreen from "./components/AuthScreen";
import LevelSelectionScreen from "./components/LevelSelectionScreen";
import DashboardScreen from "./components/DashboardScreen";
import AISolverScreen from "./components/AISolverScreen";
import PracticeScreen from "./components/PracticeScreen";
import ProfileScreen from "./components/ProfileScreen";
import { UserState, MathLevel } from "./types";

export default function App() {
  const [screen, setScreen] = useState<
    "onboarding" | "auth" | "level-selection" | "dashboard" | "solver" | "practice" | "profile"
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

  const [selectedPracticeTopic, setSelectedPracticeTopic] = useState<string | undefined>(undefined);

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem("mathverse_user", JSON.stringify(userState));
  }, [userState]);

  // Adjust starting screen based on onboard status
  useEffect(() => {
    if (userState.onboarded && userState.currentLevel) {
      setScreen("dashboard");
    } else if (userState.email) {
      setScreen("level-selection");
    } else {
      setScreen("onboarding");
    }
  }, []);

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

  const handleLogOut = () => {
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
        />
      )}
    </div>
  );
}
