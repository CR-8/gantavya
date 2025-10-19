import React from "react";

interface BgforegroundProps {
  title?: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

function Bgforeground({
  title = "GANTAVYA",
  subtitle = "TECH PREMIER OF SRMCEM",
  titleClassName = "",
  subtitleClassName = "",
}: BgforegroundProps) {
  return (
    <div className="min-h-screen w-screen z-20 bg-transparent flex flex-col items-center justify-center text-neutral-200">
      {/* Title */}
      <div className="w-screen flex flex-col items-center justify-center mb-2">
        <span className={`font-barbara text-[18vw] ${titleClassName}`}>
          {title}
        </span>
        <span className={`-mt-8 font-bricolage text-4xl ${subtitleClassName}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}

export default Bgforeground;
