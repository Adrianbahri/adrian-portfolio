import LoadingScreen from '@/components/LoadingScreen';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Achievements from '@/components/Achievements';
import Contact from '@/components/Contact';
import SmoothScrolling from '@/components/SmoothScrolling';


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
        <About />
        <Experience />
        <Achievements />
        <Contact />
      </main>
    </SmoothScrolling>
  );
}
