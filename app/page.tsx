import HomeClient from "@/components/HomeClient";
import { getHomeStats } from "@/lib/home-cache";

export default async function HomePage() {
  const { oralStats, writtenStats } = await getHomeStats();

  return (
    <HomeClient
      oralStats={oralStats}
      writtenStats={writtenStats}
    />
  );
}