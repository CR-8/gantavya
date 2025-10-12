import React from 'react'
import { Stack , Triangle , Cube } from '@/components/layout/svgAbout'

function AboutSvg() {
  return (
    <div className='h-80 max-w-4xl flex items-center justify-center'>
        <Stack/>
        <Triangle/>
        <Cube/>
    </div>
  )
}

export default AboutSvg