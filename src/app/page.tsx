import React from 'react'
import Hero from '@/components/home/hero'
import About from '@/components/home/about'

function Home() {
  return (
    <div className=''>
      <Hero/>
      <div className='absolute top-0 left-0 w-full h-full'>
      </div>
      <About/>
    </div>
  )
}

export default Home