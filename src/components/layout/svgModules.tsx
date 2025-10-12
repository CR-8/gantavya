'use client';

import { useRef, useEffect } from "react";
import gsap from "gsap";
import Image from "next/image";


export function Triangle() {
  const figureRef = useRef(null);

  useEffect(() => {
    gsap.to(figureRef.current, {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: "none"
    });
  }, []);
  return (
    <figure
      ref={figureRef}
      className="relative overflow-hidden"
      style={{
        width: "300px",
        height: "300px",
        transform: "rotate(42.255deg)",
        opacity: 0.5,
        borderRadius: "inherit"
      }}
    >
      <Image
        src="https://framerusercontent.com/images/93NVWJJQujdEcPewVpg3Xp7ip4.webp?scale-down-to=512"
        alt="Triangle"
        width={855}
        height={855}
        className="w-full h-full object-cover object-center rounded-[inherit]"
      />
    </figure>
  )
}



export function CubeLarge() {
  const figureRef = useRef(null);

  useEffect(() => {
    gsap.to(figureRef.current, {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: "none"
    });
  }, []);
  return (
    <figure
      ref={figureRef}
      className="relative overflow-hidden"
      style={{
        width: "650px",
        height: "650px",
        transform: "rotate(225.32deg)",
        opacity: 0.5,
        borderRadius: "inherit"
      }}
    >
      <Image
        src="https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp?scale-down-to=512"
        alt="Cube Large"
        width={855}
        height={855}
        className="w-full h-full object-cover object-center rounded-[inherit]"
      />
    </figure>
  )
}



export function CubeSmall() {
  const figureRef = useRef(null);

  useEffect(() => {
    gsap.to(figureRef.current, {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: "none"
    });
  }, []);
  return (
    <figure
      ref={figureRef}
      className="relative overflow-hidden"
      style={{
        width: "120px",
        height: "120px",
        transform: "rotate(295.565deg)",
        opacity: 0.5,
        borderRadius: "inherit"
      }}
    >
      <Image
        src="https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp?scale-down-to=512"
        alt="Cube Small"
        width={855}
        height={855}
        className="w-full h-full object-cover object-center rounded-[inherit]"
      />
    </figure>
  )
}
