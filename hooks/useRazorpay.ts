"use client";

import { useEffect, useState } from "react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function useRazorpay() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (window.Razorpay) {
            setLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => setLoaded(true);

        script.onerror = () => {
            console.error("Failed to load Razorpay.");
        };

        document.body.appendChild(script);
    }, []);

    return loaded;
}