import React from 'react'
import AboutSvg from './aboutSvg'

function About() {
  return (
    <div className='relative min-h-[80vh] w-screen bg-black flex flex-col tracking-tighter'>
        <div className='m-12 h-40 w-[50vw] text-7xl font-bricolage'>
            <span className='text-neutral-300'>Why you should come to </span>
            <span className='text-neutral-500'>Gantavya 2025</span>
        </div>
        <div className='mx-12 flex items-center justify-between '>
            <AboutSvg/>
            <div className='text-neutral-300 w-lg text-xl font-bricolage font-bold'>
                Gantavya 2025 is not just an event; it&apos;s a transformative experience that promises to ignite your passion for technology, foster innovation, and create lasting memories. Here&apos;s why you should be a part of this incredible journey:
                <br />
                <br />
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit eius eos laborum.
            </div>
        </div>
    </div>
  )
}

export default About