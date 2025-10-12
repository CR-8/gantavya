import React from 'react'
import Bgforeground from './bgforeground'
import Background from './background'

function Hero() {
  return (
    <div className='h-screen w-screen relative'>
        <Background/>
        <div className='h-full w-full absolute bottom-0'>
          <Bgforeground/>
        </div>
        <div className='absolute bottom-0 left-0 right-0 h-66 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none z-30'></div>
    </div>
  )
}

export default Hero