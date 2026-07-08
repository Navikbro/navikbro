"use client";

import { useEffect, useState } from "react";

import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import CategoryCard from "@/components/CategoryCard";
import SectionHeading from "@/components/SectionHeading";
import { getOralStats } from "@/lib/orals";
import { getWrittenStats } from "@/lib/writtens";

import {
  ShieldCheck,
  Cog,
  Folder,
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

  const [oralStats, setOralStats] = useState<
    Record<
      string,
      {
        questions: number;
        topics: number;
        updatedAt: Date | null;
      }
    >
  >({});

  const [writtenStats, setWrittenStats] = useState<
    Record<
      string,
      {
        questions: number;
        topics: number;
        updatedAt: Date | null;
      }
    >
  >({});

  const requireLogin = (path: string) => {
    setRedirectPath(path);
    setShowAuth(true);
  };

  useEffect(() => {
    async function loadStats() {
      const categories = ["fn3", "fn4b", "fn5", "fn6"];

      const results = await Promise.all(
        categories.map(async (category) => ({
          category,
          stats: await getOralStats(category),
        }))
      );

      const statsMap: Record<
        string,
        {
          questions: number;
          topics: number;
          updatedAt: Date | null;
        }
      > = {};

      results.forEach(({ category, stats }) => {
        statsMap[category] = stats;
      });

      console.log("Stats Map:", statsMap);

      setOralStats(statsMap);
    }

    loadStats();
  }, []);

  // 👇 PASTE THE NEW useEffect HERE

  useEffect(() => {
    async function loadWrittenStats() {
      const categories = [
        "general",
        "mep",
        "motor",
        "met",
        "naval",
        "ssep",
      ];

      const results = await Promise.all(
        categories.map(async (category) => ({
          category,
          stats: await getWrittenStats(category),
        }))
      );

      const statsMap: Record<
        string,
        {
          questions: number;
          topics: number;
          updatedAt: Date | null;
        }
      > = {};

      results.forEach(({ category, stats }) => {
        statsMap[category] = stats;
      });

      console.log("Written Stats:", statsMap);

      setWrittenStats(statsMap);
    }

    loadWrittenStats();
  }, []);

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
              questions={oralStats.fn3?.questions}
              topics={oralStats.fn3?.topics}
              updatedAt={oralStats.fn3?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn4b"
              title="MOTOR"
              icon={Folder}
              badge="FN-4B"
              questions={oralStats.fn4b?.questions}
              topics={oralStats.fn4b?.topics}
              updatedAt={oralStats.fn4b?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn6"
              title="MEP"
              icon={Folder}
              badge="FN-6"
              questions={oralStats.fn6?.questions}
              topics={oralStats.fn6?.topics}
              updatedAt={oralStats.fn6?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/orals/fn5"
              title="ELECTRICAL"
              icon={Folder}
              badge="FN-5"
              questions={oralStats.fn5?.questions}
              topics={oralStats.fn5?.topics}
              updatedAt={oralStats.fn5?.updatedAt}
              onRequireLogin={requireLogin}
            />
          </div>
        </section>

        {/* BROWSE BY WRITTENS */}
        <section className="mt-12">
          <SectionHeading title="BROWSE BY WRITTENS" />

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <CategoryCard
              href="/writtens/general"
              title="GENERAL"
              icon={Folder}
              badge="MEKG"
              questions={writtenStats.general?.questions}
              topics={writtenStats.general?.topics}
              updatedAt={writtenStats.general?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/mep"
              title="MEP"
              icon={Folder}
              badge="MEP"
              questions={writtenStats.mep?.questions}
              topics={writtenStats.mep?.topics}
              updatedAt={writtenStats.mep?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/motor"
              title="MOTOR"
              icon={Folder}
              badge="MEKM"
              questions={writtenStats.motor?.questions}
              topics={writtenStats.motor?.topics}
              updatedAt={writtenStats.motor?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/met"
              title="ELECTRICAL"
              icon={Folder}
              badge="MET"
              questions={writtenStats.met?.questions}
              topics={writtenStats.met?.topics}
              updatedAt={writtenStats.met?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/naval"
              title="NAVAL"
              icon={Folder}
              badge="SHIP-CO"
              questions={writtenStats.naval?.questions}
              topics={writtenStats.naval?.topics}
              updatedAt={writtenStats.naval?.updatedAt}
              onRequireLogin={requireLogin}
            />

            <CategoryCard
              href="/writtens/ssep"
              title="SAFETY"
              icon={Folder}
              badge="SSEP"
              questions={writtenStats.ssep?.questions}
              topics={writtenStats.ssep?.topics}
              updatedAt={writtenStats.ssep?.updatedAt}
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