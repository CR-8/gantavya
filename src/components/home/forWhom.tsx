"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { CubeMedium } from "@/components/layout/svgModules";
import { User, BriefcaseBusiness, CodeXml } from "lucide-react";
import gsap from "gsap";

function ForWhom() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const content = marquee.querySelector(".marquee-content") as HTMLElement;
    if (!content) return;

    const clone = content.cloneNode(true) as HTMLElement;
    marquee.appendChild(clone);

    const marqueeWidth = content.offsetWidth;

    gsap.to(marquee.children, {
      x: -marqueeWidth,
      duration: 60,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % marqueeWidth),
      },
    });
  }, []);

  const attendies = [
    {
      name: "Students",
      desc: "Looking to enhance your skills and gain practical experience.",
      logo: <CodeXml size={54} />,
    },
    {
      name: "Professionals",
      desc: "Seeking to upskill and stay relevant in their field.",
      logo: <BriefcaseBusiness size={54} />,
    },
    {
      name: "Enthusiasts",
      desc: "Passionate about learning and personal growth.",
      logo: <User size={54} />,
    },
  ];

  const handleClick = (index: number) =>
    setSelectedIndex(selectedIndex === index ? null : index);

  return (
    <div className="relative pt-18 min-h-[90vh] w-screen bg-black flex flex-col tracking-tighter">
      <div className='mx-4 mt-8 h-20 w-70 text-2xl flex items-center justify-center gap-2'>
            <span className='text-transparent bg-neutral-300 h-1 w-12'>..........</span>
            <span className='text-white flex items-center justify-center'>Who Should Attend</span>
        </div>

      <div className="m-12 h-40 w-[70vw] text-7xl font-bricolage">
        <span className="text-white">
          Who Should Definitely Attend
          <br />
          <span className="text-neutral-500">Gantavya</span>
        </span>
      </div>

      <div className="h-90 w-full flex items-center justify-center gap-4">
        {attendies.map((item, index) => (
          <div
            key={index}
            onClick={() => handleClick(index)}
            className={`relative overflow-hidden
              ${selectedIndex === index ? "rounded-full" : "rounded-3xl"}
              h-90 w-90 border-2
              ${
                selectedIndex === index
                  ? "border-blue-600"
                  : "border-neutral-700"
              }
              flex flex-col items-center justify-center gap-4 
              cursor-pointer transition-all duration-300 ease-in-out
              hover:border-blue-600
              ${selectedIndex !== index && selectedIndex !== null ? "opacity-90" : ""}
            `}
          >
            {selectedIndex === index && (
              <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none blur-sm">
                <CubeMedium />
              </div>
            )}
            <div className="text-white transition-transform duration-100 relative z-10">
              {item.logo}
            </div>
            <div className="h-10 w-full text-3xl text-white font-semibold flex items-center justify-center relative z-10">
              {item.name}
            </div>
            <div
              className={`m-2 p-6 max-w-md text-lg text-neutral-400 flex items-center justify-center text-center
              transition-all duration-200 relative z-10
              ${selectedIndex === index ? "opacity-100" : "opacity-70"}`}
            >
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Marquee */}
      <div className="w-full overflow-hidden mt-16">
        <div ref={marqueeRef} className="flex whitespace-nowrap">
          <div className="marquee-content inline-block">
            <span className="font-bold text-[7vw] text-neutral-50">
              Innovation . Networking . Marketing . Innovation . Networking . Marketing . Innovation . Networking . Marketing . Innovation . Networking . Marketing .
            </span>
          </div>
        </div>
      </div>
      
      <div className='absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-black/70 to-black pointer-events-none z-20'></div>
    </div>
  );
}

export default ForWhom;
