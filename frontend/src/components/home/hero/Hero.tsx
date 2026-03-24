import React from 'react'
import Image from 'next/image'

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/hero/Hero.png"
          alt="Muslim Nikah Matrimony Hero"
          fill
          priority
          className="object-cover"
          quality={100}
        />
      </div>
      
      {/* Optional overlay for better text readability */}
      {/* <div className="absolute inset-0 bg-black/20" /> */}
      
      {/* Hero Content */}
     
    </div>
  )
}

export default Hero
