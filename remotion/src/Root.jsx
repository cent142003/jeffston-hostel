import React from 'react';
import {Composition} from 'remotion';
import {JeffstonHostelVideo} from './JeffstonHostelVideo.jsx';

export const RemotionRoot = () => (
  <Composition
    id="JeffstonHostel"
    component={JeffstonHostelVideo}
    durationInFrames={900}
    fps={30}
    width={1280}
    height={720}
  />
);
