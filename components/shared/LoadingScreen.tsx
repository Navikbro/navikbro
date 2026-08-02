"use client";

import { Sailboat } from "lucide-react";

interface Props {
  text?: string;
}

export default function LoadingScreen({
  text = "Loading Questions...",
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#f5f5f5]">

      <div className="flex flex-col items-center">

        {/* WAVES + SHIP */}
        <div className="relative mb-2 flex h-24 w-64 items-end justify-center overflow-hidden">

          {/* Wave 1 */}
          <div className="absolute bottom-0 h-6 w-[300px] rounded-[100%] bg-black/10 animate-wave1" />

          {/* Wave 2 */}
          <div className="absolute bottom-2 h-5 w-[260px] rounded-[100%] bg-black/5 animate-wave2" />


          {/* SHIP */}
          <div className="relative animate-float">

            <div className="animate-ship">
              <Sailboat
                size={60}
                strokeWidth={2}
                className="text-black"
              />
            </div>

          </div>

        </div>


        {/* TEXT */}
        <p className="mt-2 px-5 text-center text-sm tracking-wide text-gray-500">
          {text}
        </p>


      </div>

    </div>
  );
}