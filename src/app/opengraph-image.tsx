import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Sigorta Cüzdanı - Kurumsal Sigorta Yönetim Platformu'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div style={{ fontSize: 80, marginRight: 20 }}>🛡️</div>
          <div style={{ fontSize: 72, fontWeight: 'bold', color: 'white' }}>
            Sigorta Cüzdanı
          </div>
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Kurumsal Sigorta ve Poliçe Yönetim Platformu
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            gap: 30,
          }}
        >
          <span>✓ AI Destekli Analiz</span>
          <span>✓ Otomatik Vade Takibi</span>
          <span>✓ KVKK Uyumlu</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
