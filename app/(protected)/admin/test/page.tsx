"use client";

import { initializeAdminStats } from "@/services/adminService";

export default function AdminTestPage() {

    async function createStats() {

        await initializeAdminStats();

        alert("Admin stats created");

    }


    return (

        <div className="p-10">

            <button
                onClick={createStats}
                className="rounded bg-black px-5 py-3 text-white"
            >
                Create Admin Stats
            </button>

        </div>

    );

}