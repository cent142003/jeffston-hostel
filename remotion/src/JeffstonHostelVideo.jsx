import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const green = '#07c160';
const purple = '#312f3e';
const white = '#ffffff';
const sourceVideo = 'videos/jch-source-room-tour.mp4';

const rooms = [
  ['A101', 'Standard', 'GHS 5,500'],
  ['A102', 'Standard Big', 'GHS 6,700'],
  ['B202', 'General', 'GHS 6,700'],
  ['B203', 'General', 'GHS 6,800'],
  ['C302', 'Premium', 'GHS 6,000'],
  ['C303', 'Premium', 'GHS 5,500'],
];

const amenities = [
  'Secured gated access',
  'Adenta Court Complex',
  'Rooms near Legon and UPSA',
  'Wi-Fi, study desks, kitchen, laundry',
];

const appear = (frame, start, distance = 24) => ({
  opacity: interpolate(frame, [start, start + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }),
  transform: `translateY(${interpolate(frame, [start, start + 18], [distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })}px)`,
});

const fade = (frame, start, end) =>
  interpolate(frame, [start, start + 18, end - 18, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const Brand = () => (
  <div
    style={{
      position: 'absolute',
      top: 34,
      left: 48,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      color: white,
      fontWeight: 900,
      fontSize: 24,
      letterSpacing: 0,
    }}
  >
    <Img
      src={staticFile('images/logo.jpg')}
      style={{width: 50, height: 50, borderRadius: 25, objectFit: 'cover'}}
    />
    Jeffston Court Hostel
  </div>
);

const Tag = ({children, dark = false}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      border: `2px solid ${green}`,
      borderRadius: 999,
      color: dark ? purple : white,
      fontSize: 22,
      fontWeight: 900,
      padding: '10px 18px',
      background: dark ? 'rgba(255,255,255,0.9)' : 'rgba(7, 193, 96, 0.2)',
    }}
  >
    {children}
  </div>
);

const SourceVideoLayer = () => (
  <AbsoluteFill style={{background: '#111827'}}>
    <OffthreadVideo
      src={staticFile(sourceVideo)}
      muted
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'blur(18px) brightness(0.58) saturate(1.08)',
        transform: 'scale(1.15)',
      }}
    />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(17,24,39,0.78), rgba(17,24,39,0.34), rgba(17,24,39,0.86))'}} />
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 424,
        width: 432,
        background: '#000',
        boxShadow: '0 24px 80px rgba(0,0,0,0.58)',
      }}
    >
      <OffthreadVideo
        src={staticFile(sourceVideo)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </div>
  </AbsoluteFill>
);

const Intro = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, 0, 165)}}>
      <div style={{position: 'absolute', left: 62, top: 150, width: 430}}>
        <div style={appear(frame, 12)}>
          <Tag>Updated hostel tour</Tag>
        </div>
        <h1
          style={{
            ...appear(frame, 28),
            color: white,
            fontSize: 64,
            lineHeight: 0.98,
            margin: '26px 0 20px',
            fontWeight: 950,
            letterSpacing: 0,
          }}
        >
          Secure student living in Adenta
        </h1>
        <p style={{...appear(frame, 46), color: white, fontSize: 27, lineHeight: 1.35, margin: 0}}>
          A gated hostel base for students near Legon and UPSA.
        </p>
      </div>
      <div
        style={{
          ...appear(frame, 64),
          position: 'absolute',
          right: 54,
          bottom: 58,
          width: 330,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 18,
          padding: 24,
          color: purple,
          fontSize: 25,
          fontWeight: 900,
          boxShadow: '0 20px 48px rgba(0,0,0,0.32)',
        }}
      >
        Now booking 2025/2026 rooms from GHS 5,500
      </div>
    </AbsoluteFill>
  );
};

const Amenities = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, 150, 390)}}>
      <div style={{position: 'absolute', right: 54, top: 135, width: 360}}>
        <div style={appear(frame, 160)}>
          <Tag>Why students choose JCH</Tag>
        </div>
        <div style={{display: 'grid', gap: 14, marginTop: 28}}>
          {amenities.map((item, index) => (
            <div
              key={item}
              style={{
                ...appear(frame, 178 + index * 10),
                background: 'rgba(255,255,255,0.92)',
                borderLeft: `8px solid ${green}`,
                borderRadius: 14,
                padding: '18px 20px',
                color: purple,
                fontSize: 24,
                lineHeight: 1.18,
                fontWeight: 900,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Pricing = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, 365, 660)}}>
      <div style={{position: 'absolute', left: 52, top: 112, width: 360}}>
        <div style={appear(frame, 378)}>
          <Tag>Live room pricing</Tag>
        </div>
        <h2 style={{...appear(frame, 394), color: white, fontSize: 47, lineHeight: 1, margin: '24px 0'}}>
          Current available rooms
        </h2>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 52,
          bottom: 54,
          width: 385,
          display: 'grid',
          gap: 10,
        }}
      >
        {rooms.map(([code, type, price], index) => (
          <div
            key={code}
            style={{
              ...appear(frame, 410 + index * 7, 16),
              display: 'grid',
              gridTemplateColumns: '82px 1fr auto',
              gap: 10,
              alignItems: 'center',
              background: 'rgba(255,255,255,0.94)',
              borderRadius: 12,
              padding: '13px 15px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
            }}
          >
            <strong style={{color: purple, fontSize: 25}}>{code}</strong>
            <span style={{color: '#475467', fontSize: 19, fontWeight: 800}}>{type}</span>
            <strong style={{color: green, fontSize: 20}}>{price}</strong>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FinalCta = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, 640, 900)}}>
      <AbsoluteFill style={{background: 'rgba(17,24,39,0.42)'}} />
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 126,
          textAlign: 'center',
        }}
      >
        <div style={appear(frame, 662)}>
          <Tag>Book directly</Tag>
        </div>
        <h2
          style={{
            ...appear(frame, 680),
            color: white,
            fontSize: 76,
            lineHeight: 1,
            margin: '28px 0 22px',
            fontWeight: 950,
          }}
        >
          Jeffston Court Hostel
        </h2>
        <p style={{...appear(frame, 698), color: white, fontSize: 32, lineHeight: 1.3, margin: '0 auto', width: 820}}>
          Compare rooms, choose your space, and message us for booking support.
        </p>
        <div style={{...appear(frame, 724), display: 'flex', justifyContent: 'center', gap: 18, marginTop: 42}}>
          <div style={{background: green, color: white, borderRadius: 999, padding: '18px 30px', fontSize: 29, fontWeight: 950}}>
            jeffstoncourthostel.com
          </div>
          <div style={{background: white, color: purple, borderRadius: 999, padding: '18px 30px', fontSize: 29, fontWeight: 950}}>
            +233 201 349 321
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const JeffstonHostelVideo = () => {
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill style={{width, height, background: '#111827', fontFamily: 'Segoe UI, Arial, sans-serif'}}>
      <SourceVideoLayer />
      <Brand />
      <Intro />
      <Amenities />
      <Pricing />
      <FinalCta />
      <Sequence from={0} durationInFrames={900}>
        <div
          style={{
            position: 'absolute',
            bottom: 26,
            left: 48,
            color: 'rgba(255,255,255,0.72)',
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          Adenta Court Complex • Near Legon and UPSA
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
