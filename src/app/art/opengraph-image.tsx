import { ImageResponse } from 'next/og';

export const alt = '©Adrian — Creative Side & Visual Archive';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function ArtOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          padding: '0px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top Swiss Exhibition Bar with 1px Hairline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '24px 44px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
            fontSize: '16px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <span>©ADRIAN</span>
          <div style={{ display: 'flex', gap: '28px', color: '#8a8a8a' }}>
            <span style={{ color: '#ffffff' }}>ARCHIVE</span>
            <span>DESIGN</span>
            <span>PHOTO</span>
            <span>VIDEO</span>
          </div>
          <span style={{ color: '#ff5a3d' }}>DRI4N.COM/ART</span>
        </div>

        {/* Asymmetric 50/50 Swiss Exhibition Poster Body */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            width: '100%',
          }}
        >
          {/* Left 50% Column: Artistic Exhibition Statement */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '44px',
              borderRight: '1px solid rgba(255, 255, 255, 0.14)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                letterSpacing: '0.18em',
                color: '#8a8a8a',
                textTransform: 'uppercase',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#ff5a3d',
                }}
              />
              EXHIBITION ARCHIVE · VOL. 26
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '68px',
                  fontWeight: 600,
                  letterSpacing: '-0.04em',
                  lineHeight: 0.98,
                  textTransform: 'uppercase',
                }}
              >
                CREATIVE
              </div>
              <div
                style={{
                  fontSize: '68px',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.98,
                  color: '#d4d4d4',
                }}
              >
                SIDE / ART
              </div>
            </div>

            <div
              style={{
                fontSize: '15px',
                lineHeight: 1.55,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#8a8a8a',
                maxWidth: '460px',
              }}
            >
              A CURATED COLLECTION OF VISUAL DESIGN, DOCUMENTARY PHOTOGRAPHY,
              EDITORIAL PRINT &amp; MOTION DIRECTION.
            </div>
          </div>

          {/* Right 50% Column: Abstract Swiss Poster Composition (4:5 + 4:3 + 9:16 Triptych) */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '44px',
              backgroundColor: '#0e0e0d',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '14px',
                width: '100%',
                height: '330px',
              }}
            >
              {/* Frame 01: 4:5 Design Poster Block */}
              <div
                style={{
                  flex: 1.15,
                  height: '100%',
                  backgroundColor: '#faf9f6',
                  color: '#0a0a0a',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    letterSpacing: '0.12em',
                  }}
                >
                  <span>01</span>
                  <span>4:5</span>
                </div>
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '999px',
                    backgroundColor: '#ff5a3d',
                  }}
                />
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  DESIGN
                </div>
              </div>

              {/* Right Column: 02 PHOTO + 03 VIDEO */}
              <div
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#191918',
                    border: '1px solid rgba(255,255,255,0.16)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#8a8a8a',
                      letterSpacing: '0.12em',
                    }}
                  >
                    <span>02</span>
                    <span>4:3</span>
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}
                  >
                    PHOTO
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#ff5a3d',
                    color: '#0a0a0a',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      letterSpacing: '0.12em',
                      fontWeight: 600,
                    }}
                  >
                    <span>03</span>
                    <span>16:9 · 9:16</span>
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    VIDEO
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Right Caption */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.14)',
                fontSize: '13px',
                letterSpacing: '0.14em',
                color: '#8a8a8a',
              }}
            >
              <span>MULTIDISCIPLINARY CREATIVE</span>
              <span style={{ color: '#ffffff' }}>MAKASSAR, ID</span>
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
