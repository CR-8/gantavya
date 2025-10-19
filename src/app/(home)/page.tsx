import React from 'react'
import Hero from '@/components/home/hero'
import About from '@/components/home/about'
import ForWhom from '@/components/home/forWhom'
import EventAgenda from '@/components/home/eventAgenda'
import Sponsors from '@/components/home/sponsors'
import FAQ from '@/components/home/faq'
import Footer from '@/components/layout/footer'

function Home() {
  return (
    <div className='overflow-hidden'>
      <Hero/>
      <About/>
      <ForWhom/>
      <EventAgenda/>
      <Sponsors/>
      <FAQ />
      <Footer/>
    </div>
  )
}

export default Home