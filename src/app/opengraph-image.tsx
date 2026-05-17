import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Drian — Personal Portfolio';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Helper to resolve absolute image URLs
const getAbsoluteUrl = (url: string) => {
  if (!url) return 'https://heyyan.vercel.app/api/assets/uploads/profile-fallback.webp';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://heyyan.vercel.app${url.startsWith('/') ? '' : '/'}${url}`;
};

export default async function OgImage() {
  let heroImage = 'https://heyyan.vercel.app/api/assets/uploads/profile-fallback.webp';

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      // Use direct Rest API call to prevent any server-side ssr/client library import issues in Edge runtime
      const res = await fetch(
        `${supabaseUrl.replace(/\/$/, '')}/rest/v1/site_settings?select=key,value`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          next: { 
            revalidate: 3600 // Cache for 1 hour to ensure super fast subsequent loads
          }
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const settingsMap = data.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
          }, {});

          if (settingsMap.hero_image) {
            heroImage = getAbsoluteUrl(settingsMap.hero_image);
          }
        }
      }
    }
  } catch (e) {
    console.error('Error fetching site settings for OG Image generation:', e);
  }

  const currentYear = new Date().getFullYear();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#000000',
          padding: '0 100px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dynamic Blueprint Grid Background (Pixel-perfect Satori SVG rendering) */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Sub-grid lines (every 20px) */}
          {Array.from({ length: 60 }).map((_, i) => (
            <line
              key={`v-20-${i}`}
              x1={i * 20}
              y1={0}
              x2={i * 20}
              y2={630}
              stroke="rgba(255, 255, 255, 0.02)"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 32 }).map((_, i) => (
            <line
              key={`h-20-${i}`}
              x1={0}
              y1={i * 20}
              x2={1200}
              y2={i * 20}
              stroke="rgba(255, 255, 255, 0.02)"
              strokeWidth={1}
            />
          ))}
          {/* Main grid lines (every 80px) */}
          {Array.from({ length: 15 }).map((_, i) => (
            <line
              key={`v-80-${i}`}
              x1={i * 80}
              y1={0}
              x2={i * 80}
              y2={630}
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h-80-${i}`}
              x1={0}
              y1={i * 80}
              x2={1200}
              y2={i * 80}
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth={1}
            />
          ))}
        </svg>

        {/* Subtle Green Ambient Glow behind the polaroid photo */}
        <div
          style={{
            position: 'absolute',
            right: '40px',
            top: '65px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(62, 207, 142, 0.12) 0%, rgba(62, 207, 142, 0) 70%)',
          }}
        />

        {/* Left Column: Premium Branding & Intro */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '480px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '11px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: '#3ecf8e',
              marginBottom: '16px',
            }}
          >
            Creative Technologist
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '76px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-0.05em',
              marginBottom: '20px',
            }}
          >
            Drian
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '18px',
              color: '#a1a1aa',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Transforming ideas into meaningful digital experiences through design, motion, and code.
          </div>
        </div>

        {/* Right Column: Premium Polaroid Frame (Matching the site's Hero component) */}
        <div
          style={{
            display: 'flex',
            zIndex: 10,
            transform: 'rotate(2deg) scale(1.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
              backgroundColor: '#111111',
              border: '1px solid #2e2e2e',
              borderRadius: '6px',
              width: '320px',
              position: 'relative',
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Inner aesthetic border */}
            <div
              style={{
                position: 'absolute',
                inset: '16px',
                border: '1px solid #1f1f1f',
                pointerEvents: 'none',
                borderRadius: '3px',
              }}
            />

            {/* Polaroid image container (4:5 Aspect Ratio) */}
            <div
              style={{
                display: 'flex',
                width: '286px',
                height: '358px',
                backgroundColor: '#000000',
                borderRadius: '2px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={heroImage}
                alt="Adrian Visual"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Overlay for subtle dark mood blend */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                }}
              />
            </div>

            {/* Bottom Polaroid Label */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px',
                fontFamily: 'monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(237, 237, 237, 0.4)',
              }}
            >
              <span>IMG_{currentYear}_DRIAN</span>
              <span>Visual Storyteller</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
