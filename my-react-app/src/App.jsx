import React, { useState } from "react";

import Home          from "./pages/Home.jsx";
import A09TheoryLab  from "./pages/A09TheoryLab.jsx";
import A09LogSite    from "./pages/A09LogSite.jsx";
import A04           from "./pages/A04.jsx";
import A04_LoginPage from "./pages/A04_LoginPage.jsx";
import A01           from "./pages/A01.jsx";
import A01Target     from "./pages/A01Target.jsx";
import A02           from "./pages/A02.jsx";
import A02Target     from "./pages/A02Target.jsx";
import A03           from "./pages/A03.jsx";
import A03Target     from "./pages/A03Target.jsx";
import A05           from "./pages/A05.jsx";
import A05Lab        from "./pages/A05Page.jsx";
import A06           from "./pages/A06.jsx";
import A06Page       from "./pages/A06Page.jsx";
import A07           from "./pages/A07.jsx";
import A07Page       from "./pages/A07Page.jsx";
import A08           from "./pages/A08.jsx";
import A08Page       from "./pages/A08Page.jsx";
import A10           from "./pages/A10.jsx";
import A10Page       from "./pages/A10Page.jsx";

function App() {
  const [currentModule, setCurrentModule] = useState(null);

  const urlParams    = new URLSearchParams(window.location.search);
  const isTargetSite = urlParams.get("mode") === "target_site";
  const isA01Target  = urlParams.get("mode") === "a01_target";
  const isA02Target  = urlParams.get("mode") === "a02_target";
  const isA03Target  = urlParams.get("mode") === "a03_target";
  const isA09Logs    = urlParams.get("mode") === "a09_logs";
  const isA05Lab     = urlParams.get("mode") === "a05_lab";
  const isA06Lab     = urlParams.get("mode") === "a06_lab";
  const isA07Lab     = urlParams.get("mode") === "a07_lab";
  const isA08Lab     = urlParams.get("mode") === "a08_lab";
  const isA10Target  = urlParams.get("mode") === "a10_target";

  // ── Target / standalone overrides (opened in new tab) ──────────
  if (isA09Logs)    return <A09LogSite />;
  if (isA02Target)  return <A02Target />;
  if (isA01Target)  return <A01Target />;
  if (isA05Lab)     return <A05Lab onBack={() => window.close()} />;
  if (isA06Lab)     return <A06Page onBack={() => window.close()} />;
  if (isA07Lab)     return <A07Page onBack={() => window.close()} />;
  if (isA08Lab)     return <A08Page onBack={() => window.close()} />;
  if (isA03Target)  return <A03Target />;
  if (isA10Target)  return <A10Page onBack={() => window.close()} />;
  if (isTargetSite) {
    return (
      <A04_LoginPage
        onBypassSuccess={() => alert("Progress synchronized. System Flag Captured!")}
        onCancel={() => window.close()}
      />
    );
  }

  // ── Navigation ──────────────────────────────────────────────────
  const handleSelectModule = (moduleId) => setCurrentModule(moduleId);
  const handleBackToHome   = () => setCurrentModule(null);

  if (currentModule === "a01") return <A01 onBack={handleBackToHome} />;
  if (currentModule === "a02") return <A02 onBack={handleBackToHome} />;
  if (currentModule === "a03") return <A03 onBack={handleBackToHome} />;
  if (currentModule === "a04") return <A04 onBack={handleBackToHome} />;

  if (currentModule === "a05") {
    return (
      <A05
        onBack={handleBackToHome}
        onOpenLab={() => window.open("/?mode=a05_lab", "_blank")}
      />
    );
  }

  if (currentModule === "a06") {
    return (
      <A06
        onBack={handleBackToHome}
        onOpenLab={() => window.open("/?mode=a06_lab", "_blank")}
      />
    );
  }

  if (currentModule === "a07") {
    return (
      <A07
        onBack={handleBackToHome}
        onOpenLab={() => window.open("/?mode=a07_lab", "_blank")}
      />
    );
  }

  if (currentModule === "a08") {
    return (
      <A08
        onBack={handleBackToHome}
        onOpenLab={() => window.open("/?mode=a08_lab", "_blank")}
      />
    );
  }

  if (currentModule === "a09") return <A09TheoryLab onBack={handleBackToHome} />;
  if (currentModule === "a10") return <A10 onBack={handleBackToHome} />;

  // ── Under construction placeholder ──────────────────────────────
  const implemented = ["a01", "a02", "a03", "a04", "a05", "a06", "a07", "a08", "a09", "a10"];
  if (currentModule && !implemented.includes(currentModule)) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">
          Module {currentModule.toUpperCase()} Under Construction
        </h2>
        <p className="text-slate-400 mb-6">
          This laboratory practice is currently being developed.
        </p>
        <button
          onClick={handleBackToHome}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return <Home onSelectModule={handleSelectModule} />;
}

export default App;