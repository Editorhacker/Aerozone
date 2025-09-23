"use client";

import React, { useEffect, useRef } from "react";
import astronaut from "../../src/assets/astronaut.png";
import { gsap } from "gsap";

export default function Preloader({ onLoaded }) {
  const loaderRef = useRef(null);
  const astronautRef = useRef(null);

  useEffect(() => {
    // Astronaut floating animation
    gsap.to(astronautRef.current, {
      y: -20,
      duration: 1.5,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
    });
    gsap.to(astronautRef.current, {
      rotation: 10,
      duration: 2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    // Simulate loading delay
    const timer = setTimeout(() => {
      gsap.to(loaderRef.current, {
        opacity: 0,
        duration: 1,
        onComplete: onLoaded, // fade out then trigger onLoaded
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [onLoaded]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50"
    >
      <img
        ref={astronautRef}
        src={astronaut}
        alt="Astronaut"
        className="w-32 md:w-40 mb-6"
      />
      <div className="text-white text-xl md:text-2xl font-bold animate-pulse">
        Loading...
      </div>
    </div>
  );
}
