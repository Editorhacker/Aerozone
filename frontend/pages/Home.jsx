"use client";

import React, { useEffect, useRef, useState } from "react";
import Preloader from "../components/module1/Preloader";
import { gsap } from "gsap";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  const astronautRef = useRef(null);

  useEffect(() => {
        if (!loaded) return; // only run after loaded is true

    // Floating up and down animation
    gsap.to(astronautRef.current, {
      y: -30,
      duration: 3,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
    });

    // Slight rotation
    gsap.to(astronautRef.current, {
      rotation: 5,
      duration: 4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, [loaded]); // <-- depend on loaded
  
  return (
    <>
    {!loaded && <Preloader onLoaded={() => setLoaded(true)} />}

      {loaded && (
        <main className="relative min-h-screen  bg-black text-white">

          <div className="text-center">
            {/* Hero Section */}
            <div className="relative flex items-center justify-center h-screen text-center overflow-hidden">
              {/* Earth at bottom */}
              <img 
                loading="lazy"
                src="./src/assets/earth.png"
                alt="Earth"
                className="absolute bottom-0 w-full h-full object-cover opacity-80"
              />

              {/* BACK text */}
              <h2 className="absolute text-[5rem] md:text-[8rem] font-extrabold tracking-wider z-10 text-white  ">
                AEROZONE
              </h2>

              {/* Astronaut */}
              <img
                ref={astronautRef}
                src="./src/assets/astronaut.png"
                alt="Astronaut"
                className="absolute md:w-[450px] w-[400px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
              />

              {/* FRONT text */}
              <h2 className="absolute text-[5rem] md:text-[8rem] font-extrabold tracking-wider z-30 text-outline">
                AEROZONE
              </h2>
            </div>
          </div>
        </main>
      )}

    </>
  );
}
