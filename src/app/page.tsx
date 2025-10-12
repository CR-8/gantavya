import React from 'react'
import Hero from '@/components/home/hero'
import About from '@/components/home/about'
import ForWhom from '@/components/home/forWhom'
import EventAgenda from '@/components/home/eventAgenda'

function Home() {
  return (
    <div className='overflow-hidden'>
      <Hero/>
      <About/>
      <ForWhom/>
      <EventAgenda/>
    </div>
  )
}

export default Home