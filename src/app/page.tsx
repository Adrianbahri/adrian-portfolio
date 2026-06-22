import LoadingScreen from '@/components/LoadingScreen';
import Hero from '@/components/Hero';
import FeaturedWork from '@/components/FeaturedWork';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Achievements from '@/components/Achievements';
import BentoTechStack from '@/components/BentoTechStack';
import Contact from '@/components/Contact';
import SmoothScrolling from '@/components/SmoothScrolling';

import PhotoGallery from '@/components/PhotoGallery';
import VideoShowcase from '@/components/VideoShowcase';
import DesignShowcase from '@/components/DesignShowcase';

import { supabase } from '@/lib/supabase';

export default async function Home() {
  let initialSettings: Record<string, string> = {};

  try {
    const { data } = await supabase.from('site_settings').select('key, value');
    if (data) {
      initialSettings = data.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    }
  } catch (e) {
    console.error("Error fetching site settings server-side:", e);
  }

  return (
    <SmoothScrolling>
      <main className="min-h-screen">
        <LoadingScreen />
        <Hero initialSettings={initialSettings} />
        <FeaturedWork />
        <About />
        <Experience />
        <Achievements />
        <BentoTechStack />
        <Contact />
      </main>
    </SmoothScrolling>
  );
}
