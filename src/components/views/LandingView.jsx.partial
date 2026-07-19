import { Nav } from "../landing/Nav";
import { Hero } from "../landing/Hero";
import { Problem } from "../landing/Problem";
import { Dashboard } from "../landing/Dashboard";
import { How } from "../landing/How";
import { Pricing } from "../landing/Pricing";
import { CTA } from "../landing/CTA";
import { Footer } from "../landing/Footer";
import { I18nProvider } from "../../lib/i18n";

export default function LandingView({ onLoginClick }) {
  return (
    <I18nProvider>
      <main className="min-h-screen bg-graphite w-full overflow-x-hidden">
        {/* We pass a custom onLoginClick to Nav so the user can open AuthView */}
        <Nav onLoginClick={onLoginClick} />
        <Hero />
        <Problem />
        <Dashboard />
        <How />
        <Pricing />
        <CTA />
        <Footer />
      </main>
    </I18nProvider>
  );
}
