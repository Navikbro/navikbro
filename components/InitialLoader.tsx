"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function InitialLoader({
  children,
}: {
  children: React.ReactNode;
}) {

  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const timer=setTimeout(()=>{
      setLoading(false);
    },2000);

    return ()=>clearTimeout(timer);

  },[]);


  if(loading){
    return (
      <LoadingScreen 
        text="Compiling confidence... Almost there!"
      />
    );
  }


  return children;
}