import React from 'react'
import Hero from '@/components/home/hero'
import About from '@/components/home/about'

function Home() {
  return (
    <div className='overflow-hidden'>
      <Hero/>
      <About/>
    </div>
  )
}

export default Home