import { NextRequest, NextResponse } from "next/server";
import { getOralBatchPage } from "@/services/oralBatch.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const batch = Number(searchParams.get("batch"));

  if (!category || !batch) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  console.log("API REQUEST", {
    category,
    batch,
  });

  const result = await getOralBatchPage(
    category,
    batch
  );

  console.log("API RESPONSE", result);

  return NextResponse.json(result);
}