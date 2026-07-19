import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Dashboard } from "@/components/landing/Dashboard";
import { How } from "@/components/landing/How";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { I18nProvider } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <I18nProvider>
      <main className="min-h-screen bg-graphite">
        <Nav />
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
