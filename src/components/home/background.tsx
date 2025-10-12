import React from 'react'
import Silk from './silk';
import SilkOverlay from './silkOverlay';
function Background() {
  return (
    <div className='w-full min-h-screen'>
        <Silk
          speed={11}
          scale={0.3}
          color="#5227FF"
          noiseIntensity={3.3}
          rotation={3.07}
        />
        <SilkOverlay />     
    </div>
  )
}

export default Background
