import GlobalNav from '@/components/GlobalNav';
import LoadingScreen from '@/components/LoadingScreen';
import Hero from '@/components/Hero';
import FeaturedWork from '@/components/FeaturedWork';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Achievements from '@/components/Achievements';
import BentoTechStack from '@/components/BentoTechStack';
import CreativeShowcase from '@/components/CreativeShowcase';
import Contact from '@/components/Contact';
import SmoothScrolling from '@/components/SmoothScrolling';

export default function Home() {
  return (
    <SmoothScrolling>
      <main className="min-h-screen">
        <LoadingScreen />
        <GlobalNav />
        <Hero />
        <FeaturedWork />
        <About />
        <Experience />
        <Achievements />
        <BentoTechStack />
        <CreativeShowcase />
        <Contact />
      </main>
    </SmoothScrolling>
  );
}
