import React from 'react'
import { Triangle , CubeLarge , CubeSmall } from '../layout/svgModules'

function SilkOverlay() {
  return (
    <div className='h-screen w-full absolute top-0 left-0 gap-4 pointer-events-none'>
        <div className='absolute top-70 -right-20 animate-float'>
            <Triangle />
        </div>
        <div className='absolute top-55 -left-35 animate-float'>
            <CubeLarge />
        </div>
        <div className='absolute top-30 left-[50vw] animate-float'>
            <CubeSmall />
        </div>
    </div>
  )
}

export default SilkOverlay