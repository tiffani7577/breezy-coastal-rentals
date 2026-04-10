import { useState, useCallback } from "react";
import SplashScreen from "./SplashScreen";

interface AppWithSplashProps {
  children: React.ReactNode;
}

export default function AppWithSplash({ children }: AppWithSplashProps) {
  const [ready, setReady] = useState(false);
  const [fading, setFading] = useState(false);

  const handleReady = useCallback(() => {
    // Fade out splash, then show app
    setFading(true);
    setTimeout(() => setReady(true), 500);
  }, []);

  if (ready) {
    return <>{children}</>;
  }

  return (
    <>
      {/* App content pre-rendered but invisible until ready */}
      <div style={{ visibility: "hidden", pointerEvents: "none", position: "fixed", inset: 0 }}>
        {children}
      </div>

      {/* Splash overlay */}
      <div
        style={{
          transition: "opacity 0.5s ease",
          opacity: fading ? 0 : 1,
          pointerEvents: fading ? "none" : "auto",
        }}
      >
        <SplashScreen onReady={handleReady} />
      </div>
    </>
  );
}
