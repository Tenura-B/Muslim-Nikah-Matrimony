import React from 'react'
import AboutHeader from '@/components/about/header'
import BuiltSection from '@/components/about/built'
import MissionSection from '@/components/about/mission'
import WhyChooseSection from '@/components/about/why'
import ReadySection from '@/components/home/ready/ready'

function page() {
  return (
    <main>
      <AboutHeader />
      <BuiltSection />
      <MissionSection />
      <WhyChooseSection />
      <ReadySection />
    </main>
  )
}

export default page