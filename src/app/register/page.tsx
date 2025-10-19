import React from 'react'
import Hero from '@/components/home/hero'
import Grid from '@/components/events/grid'


function Events() {
  return (
    <div className='w-full h-screen'>
        <Hero 
            title="Events"
            subtitle="Explore Our Exciting Events"
        />
        <Grid/>
    </div>
  )
}

export default Events