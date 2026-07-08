import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const green = '#07c160';
const purple = '#312f3e';
const white = '#ffffff';

const photos = [
  'images/bedroom2.jpg',
  'images/bedroom1.jpg',
  'images/bedroom3.jpg',
  'images/kit2.jpg',
  'images/liv3.jpg',
  'images/laundryroom.jpg',
];

const rooms = [
  ['A101', 'Standard', '2/4', 'GHS 5,500'],
  ['A102', 'Standard Big', '0/4', 'GHS 6,700'],
  ['B202', 'General', '2/3', 'GHS 6,700'],
  ['B203', 'General', '0/4', 'GHS 6,800'],
  ['C302', 'Premium', '1/2', 'GHS 6,000'],
  ['C303', 'Premium', '1/3', 'GHS 5,500'],
];

const facilities = [
  'Wi-Fi for study and streaming',
  'Air-conditioned rooms',
  'Study desks and storage',
  'Shared kitchen and laundry',
  'Smart TV and common lounge',
  'Water, power, and support',
];

const fade = (frame, start, end) =>
  interpolate(frame, [start, start + 18, end - 18, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const Scene = ({children, start, end}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, start, end)}}>
      {children}
    </AbsoluteFill>
  );
};

const Background = ({src, dim = 0.56}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame % 180, [0, 180], [1.02, 1.1]);

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill style={{background: `rgba(17, 24, 39, ${dim})`}} />
    </AbsoluteFill>
  );
};

const Brand = () => (
  <div
    style={{
      position: 'absolute',
      top: 34,
      left: 48,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      color: white,
      fontWeight: 800,
      letterSpacing: 0,
      fontSize: 24,
    }}
  >
    <Img
      src={staticFile('images/logo.jpg')}
      style={{width: 50, height: 50, borderRadius: 25, objectFit: 'cover'}}
    />
    Jeffston Court Hostel
  </div>
);

const Tag = ({children}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      border: `2px solid ${green}`,
      borderRadius: 999,
      color: white,
      fontSize: 23,
      fontWeight: 800,
      padding: '10px 18px',
      background: 'rgba(7, 193, 96, 0.18)',
    }}
  >
    {children}
  </div>
);

const HeroScene = () => (
  <>
    <Background src="images/bedroom2.jpg" dim={0.6} />
    <Brand />
    <div style={{position: 'absolute', left: 70, bottom: 92, width: 850}}>
      <Tag>Now booking 2025/2026</Tag>
      <h1
        style={{
          color: white,
          fontSize: 78,
          lineHeight: 0.96,
          margin: '28px 0 20px',
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        Student living near Legon and UPSA
      </h1>
      <p style={{color: white, fontSize: 30, lineHeight: 1.35, margin: 0}}>
        Secure rooms in Adenta Court Complex with Wi-Fi, study desks, kitchen,
        laundry, and reliable utilities.
      </p>
    </div>
  </>
);

const RoomsScene = () => {
  const frame = useCurrentFrame();
  const photoIndex = Math.floor((frame - 150) / 40) % 3;

  return (
    <>
      <Background src={photos[Math.max(0, photoIndex)]} dim={0.48} />
      <Brand />
      <div style={{position: 'absolute', left: 60, top: 130}}>
        <Tag>Rooms from GHS 5,500</Tag>
        <h2 style={{color: white, fontSize: 56, margin: '24px 0 0'}}>
          Compare by room code, occupancy, and rent
        </h2>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          bottom: 58,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        {rooms.map(([code, type, occ, price], index) => (
          <div
            key={code}
            style={{
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 18px 42px rgba(0,0,0,0.22)',
              transform: `translateY(${interpolate(frame, [150 + index * 5, 178 + index * 5], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
              opacity: interpolate(frame, [150 + index * 5, 178 + index * 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            <div style={{color: purple, fontSize: 34, fontWeight: 900}}>
              {code}
            </div>
            <div style={{color: '#4b5563', fontSize: 20}}>{type}</div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 18}}>
              <strong style={{color: '#111827', fontSize: 22}}>{occ}</strong>
              <strong style={{color: green, fontSize: 24}}>{price}</strong>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const FacilitiesScene = () => (
  <>
    <Background src="images/kit2.jpg" dim={0.5} />
    <Brand />
    <div style={{position: 'absolute', left: 70, top: 120, right: 70}}>
      <Tag>Built for daily student life</Tag>
      <h2 style={{color: white, fontSize: 62, margin: '24px 0 30px'}}>
        Facilities that support study, comfort, and routine
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
        }}
      >
        {facilities.map((item) => (
          <div
            key={item}
            style={{
              background: 'rgba(255,255,255,0.9)',
              borderLeft: `8px solid ${green}`,
              borderRadius: 14,
              color: purple,
              fontSize: 25,
              fontWeight: 800,
              padding: '22px 24px',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  </>
);

const CampusScene = () => (
  <>
    <Background src="images/liv3.jpg" dim={0.58} />
    <Brand />
    <div style={{position: 'absolute', left: 70, top: 124, right: 70}}>
      <Tag>Campus access</Tag>
      <h2 style={{color: white, fontSize: 66, margin: '22px 0 22px'}}>
        A practical base for Legon and UPSA students
      </h2>
      <p style={{color: white, fontSize: 31, width: 790, lineHeight: 1.35}}>
        Use the website to compare rooms, check availability, and book directly
        for the academic year.
      </p>
      <div style={{display: 'flex', gap: 22, marginTop: 40}}>
        {['Hostel near University of Ghana Legon', 'Hostel near UPSA'].map((text) => (
          <div
            key={text}
            style={{
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 16,
              color: purple,
              fontSize: 30,
              fontWeight: 900,
              padding: '28px 34px',
              width: 510,
            }}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  </>
);

const CtaScene = () => (
  <>
    <Background src="images/bedroom1.jpg" dim={0.62} />
    <Brand />
    <div style={{position: 'absolute', left: 70, right: 70, top: 132, textAlign: 'center'}}>
      <Tag>Book your room</Tag>
      <h2 style={{color: white, fontSize: 76, margin: '28px 0 22px', lineHeight: 1}}>
        Jeffston Court Hostel
      </h2>
      <p style={{color: white, fontSize: 34, lineHeight: 1.35, margin: '0 auto', width: 850}}>
        View current room availability, choose your space, and contact us for
        booking support.
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 18,
          marginTop: 44,
        }}
      >
        <div style={{background: green, color: white, borderRadius: 999, padding: '18px 32px', fontSize: 30, fontWeight: 900}}>
          jeffstoncourthostel.com
        </div>
        <div style={{background: white, color: purple, borderRadius: 999, padding: '18px 32px', fontSize: 30, fontWeight: 900}}>
          WhatsApp: +233 201 349 321
        </div>
      </div>
    </div>
  </>
);

export const JeffstonHostelVideo = () => {
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill style={{width, height, background: '#111827', fontFamily: 'Segoe UI, Arial, sans-serif'}}>
      <Scene start={0} end={170}>
        <HeroScene />
      </Scene>
      <Scene start={150} end={410}>
        <RoomsScene />
      </Scene>
      <Scene start={390} end={630}>
        <FacilitiesScene />
      </Scene>
      <Scene start={610} end={850}>
        <CampusScene />
      </Scene>
      <Scene start={830} end={1080}>
        <CtaScene />
      </Scene>
    </AbsoluteFill>
  );
};
