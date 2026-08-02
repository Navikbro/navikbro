import HomeClient from "@/components/home/HomeClient";
import { getHomeStats } from "@/lib/cache/home-cache";

export default async function HomePage() {
  const { oralStats, writtenStats } = await getHomeStats();

  return (
    <HomeClient
      oralStats={oralStats}
      writtenStats={writtenStats}
    />
  );
}