import React from 'react'
import Bgforeground from './bgforeground'
import Background from './background'

interface HeroProps {
  title?: string;
  subtitle?: string;
  showBackground?: boolean;
  showGradient?: boolean;
  titleClassName?: string;
  subtitleClassName?: string;
  backgroundComponent?: React.ReactNode;
}

function Hero({
  title = "GANTAVYA",
  subtitle = "TECH PREMIER OF SRMCEM",
  showBackground = true,
  showGradient = true,
  titleClassName = "",
  subtitleClassName = "",
  backgroundComponent,
}: HeroProps) {
  return (
    <div className='h-screen w-screen relative'>
        {showBackground && (backgroundComponent || <Background/>)}
        <div className='h-full w-full absolute bottom-0'>
          <Bgforeground 
            title={title}
            subtitle={subtitle}
            titleClassName={titleClassName}
            subtitleClassName={subtitleClassName}
          />
        </div>
        {showGradient && (
          <div className='absolute bottom-0 left-0 right-0 h-66 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none z-30'></div>
        )}
    </div>
  )
}

export default Hero