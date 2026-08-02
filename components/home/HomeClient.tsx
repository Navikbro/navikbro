"use client";

import { useState } from "react";

import Header from "@/components/home/Header";
import AuthModal from "@/components/auth/AuthModal";
import CategoryCard from "@/components/home/CategoryCard";
import SectionHeading from "@/components/home/SectionHeading";

import { Folder } from "lucide-react";

interface Stats {
  questions: number;
  topics: number;
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


        {/* BROWSE BY WRITTENS */}
        <section className="mt-12">

          <SectionHeading title="BROWSE BY WRITTENS" />

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">

            <CategoryCard
              href="/writtens/general"
              title="MEKG"
              icon={Folder}
              badge="GENERAL"
              questions={writtenStats.general?.questions ?? 0}
              topics={writtenStats.general?.topics ?? 0}
              updatedAt={writtenStats.general?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/mep"
              title="MEP"
              icon={Folder}
              badge="MEP"
              questions={writtenStats.mep?.questions ?? 0}
              topics={writtenStats.mep?.topics ?? 0}
              updatedAt={writtenStats.mep?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/motor"
              title="MEKM"
              icon={Folder}
              badge="MOTOR"
              questions={writtenStats.motor?.questions ?? 0}
              topics={writtenStats.motor?.topics ?? 0}
              updatedAt={writtenStats.motor?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/met"
              title="MET"
              icon={Folder}
              badge="ELECTRICAL"
              questions={writtenStats.met?.questions ?? 0}
              topics={writtenStats.met?.topics ?? 0}
              updatedAt={writtenStats.met?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/naval"
              title="SHIP-CO"
              icon={Folder}
              badge="NAVAL"
              questions={writtenStats.naval?.questions ?? 0}
              topics={writtenStats.naval?.topics ?? 0}
              updatedAt={writtenStats.naval?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/ssep"
              title="SSEP"
              icon={Folder}
              badge="SAFETY"
              questions={writtenStats.ssep?.questions ?? 0}
              topics={writtenStats.ssep?.topics ?? 0}
              updatedAt={writtenStats.ssep?.updatedAt}
              onRequireLogin={requireLogin}
            />

          </div>
        </section>

        {/* BROWSE BY ORALS */}
        <section className="mt-10">
          <SectionHeading title="BROWSE BY ORALS" />

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">

            <CategoryCard
              href="/orals/fn3"
              title="SAFETY"
              icon={Folder}
              badge="FN-3"
              questions={oralStats.fn3?.questions ?? 0}
              topics={oralStats.fn3?.topics ?? 0}
              updatedAt={oralStats.fn3?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn4b"
              title="MOTOR"
              icon={Folder}
              badge="FN-4B"
              questions={oralStats.fn4b?.questions ?? 0}
              topics={oralStats.fn4b?.topics ?? 0}
              updatedAt={oralStats.fn4b?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn6"
              title="MEP"
              icon={Folder}
              badge="FN-6"
              questions={oralStats.fn6?.questions ?? 0}
              topics={oralStats.fn6?.topics ?? 0}
              updatedAt={oralStats.fn6?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn5"
              title="ELECTRICAL"
              icon={Folder}
              badge="FN-5"
              questions={oralStats.fn5?.questions ?? 0}
              topics={oralStats.fn5?.topics ?? 0}
              updatedAt={oralStats.fn5?.updatedAt}
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