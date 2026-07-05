"use client";

import { useState } from "react";

import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import CategoryCard from "@/components/CategoryCard";
import SectionHeading from "@/components/SectionHeading";

import {
  ShieldCheck,
  Cog,
  ShipWheel,
  Zap,
  BookOpen,
  Wrench,
  ChartColumn,
  Anchor,
  FileText,
} from "lucide-react";

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  const requireLogin = (path: string) => {
    setRedirectPath(path);
    setShowAuth(true);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-7xl px-5 py-5">
        <Header setShowAuth={setShowAuth} />

        {/* Browse by Orals */}
        <section className="mt-10">
          <SectionHeading title="Browse by Orals" />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <CategoryCard
              href="/orals/fn3"
              title="FN3"
              subtitle="Safety"
              icon={ShieldCheck}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn4b"
              title="FN4B"
              subtitle="Motor"
              icon={Cog}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn6"
              title="FN6"
              subtitle="MEP"
              icon={ShipWheel}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn5"
              title="FN5"
              subtitle="Electrical"
              icon={Zap}
              onRequireLogin={requireLogin}
            />
          </div>
        </section>

        {/* Browse by Writtens */}
        <section className="mt-12">
          <SectionHeading title="Browse by Writtens" />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <CategoryCard
              href="/writtens/general"
              title="General"
              icon={BookOpen}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/mep"
              title="MEP"
              icon={Wrench}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/motor"
              title="Motor"
              icon={Cog}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/met"
              title="MET"
              icon={ChartColumn}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/naval"
              title="Naval"
              icon={Anchor}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/ssep"
              title="SSEP"
              icon={FileText}
              onRequireLogin={requireLogin}
            />
          </div>
        </section>
      </div>

      <AuthModal
        show={showAuth}
        setShow={setShowAuth}
        redirectPath={redirectPath}
      />
    </main>
  );
}