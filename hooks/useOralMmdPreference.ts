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


        if (
          mounted &&
          data.oralMmd
        ) {

          setMmdState(
            data.oralMmd
          );

        }


      } catch (error) {

        console.error(
          "Failed loading MMD preference:",
          error
        );

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

    try {

      await updateOralMmdPreference(
        value
      );


      setMmdState(
        value
      );


    } catch (error) {

      console.error(
        "Failed saving MMD preference:",
        error
      );


      throw error;

    }

  };



  return {

    mmd,

    loading,

    setMmd,

  };

}