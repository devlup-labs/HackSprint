import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoute";
import InstallPrompt from "./components/InstallPrompt.jsx";
import Chatbot from "./components/Chatbot.jsx";
import FirstVisitIntro from "./components/FirstVisitIntro.jsx";
import { usePageViewTracking } from "./hooks/useAnalytics.js";
import React from 'react';

function App() {
  usePageViewTracking();

  return (
    <>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 100000 }}
        toastOptions={{ style: { zIndex: 100000 } }}
      />
      {/* Plays on every load — Skip Intro lets anyone past it immediately.
          Every other loading state in the app (page loaders, spinners) is
          untouched. */}
      <FirstVisitIntro />
      <AppRoutes />
      <Chatbot />
      <InstallPrompt />
    </>
  );
}

export default App;
