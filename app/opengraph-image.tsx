import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export const alt = 'Trent gets Bent - Bachelor Party Limerick Generator'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#18181B',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="https://opengraph.b-cdn.net/production/images/1b37114b-ed94-4b5d-9a50-3cd5e5f1e1f2.png?token=_k9hea49B1aIPWrWhnWBFGw3Cc6ILAbw3JQMmq3EBeU&height=630&width=1200&expires=33273407022"
          alt="Trent gets Bent"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
} 