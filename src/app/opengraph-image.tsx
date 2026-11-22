import { ImageResponse } from 'next/og';

export const alt = 'Adrian (Dri4n) — Creative Technologist';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#121212',
          color: '#f1eee9',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Row: Vermilion Square Marker + Domain Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '5px',
                backgroundColor: '#ff5a3d',
              }}
            />
            <span
              style={{
                fontSize: '20px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#a3a3a3',
              }}
            >
              DRI4N.COM
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 18px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 90, 61, 0.14)',
              border: '1px solid #ff5a3d',
              color: '#ff5a3d',
              fontSize: '16px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            OPEN FOR COLLABORATION
          </div>
        </div>

        {/* Center Editorial Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxWidth: '920px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 600,
              letterSpacing: '-0.035em',
              lineHeight: 1.06,
              color: '#f1eee9',
            }}
          >
            Adrian (Dri4n)
          </div>
          <div
            style={{
              fontSize: '34px',
              fontWeight: 400,
              letterSpacing: '-0.015em',
              lineHeight: 1.35,
              color: '#aaa297',
            }}
          >
            Creative technologist &amp; full-stack developer crafting fast,
            expressive digital systems.
          </div>
        </div>

        {/* Bottom Bento Section Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '28px',
            borderTop: '1px solid #292929',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {[
              'SELECTED PROJECTS [W]',
              'CREATIVE SIDE [A]',
              'WRITING [B]',
              'TRACK RECORD [E]',
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#171717',
                  border: '1px solid #292929',
                  color: '#aaa297',
                  fontSize: '15px',
                  letterSpacing: '0.08em',
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <span
            style={{
              fontSize: '17px',
              color: '#737373',
              letterSpacing: '0.06em',
            }}
          >
            MAKASSAR, ID
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
