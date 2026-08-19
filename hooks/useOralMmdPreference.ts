"use client";

import { useEffect, useState } from "react";

import {
  fetchOralMmdPreference,
  updateOralMmdPreference,
} from "@/services/users/userPreference.client";


export function useOralMmdPreference() {

  const [mmd, setMmdState] =
    useState<string | null>(null);


  const [loading, setLoading] =
    useState(true);



  useEffect(() => {

    let mounted = true;


    async function loadPreference() {

      try {

        const data =
          await fetchOralMmdPreference();

      if (mounted) {
            setMmdState(
              data.oralMmd || "Chennai"
            );
          }


     } catch (error) {
    console.error(
        "Failed loading MMD preference:",
        error
    );

    if (mounted) {
        setMmdState("Chennai");
    }
} finally {

        if (mounted) {

          setLoading(false);

        }

      }

    }


    loadPreference();


    return () => {

      mounted = false;

    };


  }, []);

  const setMmd = async (
    value: string
  ) => {
    // Update the UI immediately
    setMmdState(value);

    try {
      // Save the preference in the background
      await updateOralMmdPreference(value);
    } catch (error) {
      console.error(
        "Failed saving MMD preference:",
        error
      );
    }
  };





  return {

    mmd,

    loading,

    setMmd,

  };

}