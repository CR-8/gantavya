'use client';

import { useRef, useEffect } from "react";
import gsap from "gsap";


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
      <img
        src="https://framerusercontent.com/images/93NVWJJQujdEcPewVpg3Xp7ip4.webp?scale-down-to=512"
        alt="Triangle"
        srcSet="https://framerusercontent.com/images/93NVWJJQujdEcPewVpg3Xp7ip4.webp?scale-down-to=512 512w, https://framerusercontent.com/images/93NVWJJQujdEcPewVpg3Xp7ip4.webp 855w"
        sizes="300px"
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
      <img
        src="https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp?scale-down-to=512"
        alt="Cube Large"
        srcSet="https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp?scale-down-to=512 512w, https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp 855w"
        sizes="650px"
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
      <img
        src="https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp?scale-down-to=512"
        alt="Cube Small"
        srcSet="https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp?scale-down-to=512 512w, https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp 855w"
        sizes="120px"
        className="w-full h-full object-cover object-center rounded-[inherit]"
      />
    </figure>
  )
}


export function CubeMedium() {
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
        width: "320px",
        height: "320px",
        transform: "rotate(295.565deg)",
        opacity: 0.5,
        borderRadius: "inherit"
      }}
    >
      <img
        src="https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp?scale-down-to=512"
        alt="Cube Small"
        srcSet="https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp?scale-down-to=512 512w, https://framerusercontent.com/images/wX62SMRMN1v1X6SFoJaoNdwo.webp 855w"
        sizes="320px"
        className="w-full h-full object-cover object-center rounded-[inherit]"
      />
    </figure>
  )
}