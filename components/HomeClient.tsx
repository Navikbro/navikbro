"use client";

import { useState } from "react";

import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import CategoryCard from "@/components/CategoryCard";
import SectionHeading from "@/components/SectionHeading";

import { Folder } from "lucide-react";

interface Stats {
  updatedAt: Date | null;
}

interface HomeClientProps {
  oralStats: Record<string, Stats>;
  writtenStats: Record<string, Stats>;
}

export default function HomeClient({
  oralStats,
  writtenStats,
}: HomeClientProps) {
  const [showAuth, setShowAuth] = useState(false);

  const requireLogin = () => {
    setShowAuth(true);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-7xl px-5 py-5">

        <Header setShowAuth={setShowAuth} />

        {/* BROWSE BY ORALS */}
        <section className="mt-10">
          <SectionHeading title="BROWSE BY ORALS" />

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">

            <CategoryCard
              href="/orals/fn3"
              title="SAFETY"
              icon={Folder}
              badge="FN-3"
              updatedAt={oralStats.fn3?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn4b"
              title="MOTOR"
              icon={Folder}
              badge="FN-4B"
              updatedAt={oralStats.fn4b?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn6"
              title="MEP"
              icon={Folder}
              badge="FN-6"
              updatedAt={oralStats.fn6?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn5"
              title="ELECTRICAL"
              icon={Folder}
              badge="FN-5"
              updatedAt={oralStats.fn5?.updatedAt}
              onRequireLogin={requireLogin}
            />

          </div>
        </section>

        {/* BROWSE BY WRITTENS */}
        <section className="mt-12">

          <SectionHeading title="BROWSE BY WRITTENS" />

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">

            <CategoryCard
              href="/writtens/general"
              title="MEKG"
              icon={Folder}
              badge="GENERAL"
              updatedAt={writtenStats.general?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/mep"
              title="MEP"
              icon={Folder}
              badge="MEP"
              updatedAt={writtenStats.mep?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/motor"
              title="MEKM"
              icon={Folder}
              badge="MOTOR"
              updatedAt={writtenStats.motor?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/met"
              title="MET"
              icon={Folder}
              badge="ELECTRICAL"
              updatedAt={writtenStats.met?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/naval"
              title="SHIP-CO"
              icon={Folder}
              badge="NAVAL"
              updatedAt={writtenStats.naval?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/ssep"
              title="SSEP"
              icon={Folder}
              badge="SAFETY"
              updatedAt={writtenStats.ssep?.updatedAt}
              onRequireLogin={requireLogin}
            />

          </div>
        </section>

      </div>

      <AuthModal
        show={showAuth}
        setShow={setShowAuth}
      />

    </main>
  );
}