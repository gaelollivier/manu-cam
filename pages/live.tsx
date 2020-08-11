import Head from 'next/head';
import * as React from 'react';
import useSWR from 'swr';

import { SWRProvider } from '../components/SWRProvider';
import { File, Image } from '../lib/useImages';

const Live = () => {
  const { data } = useSWR(`/api/live`, {
    refreshInterval: 500,
  });

  const liveImage: { file: File; manuDetection?: Image['manuDetection'] } =
    data?.liveImage;

  if (!liveImage) {
    return null;
  }

  const manuAIBox = liveImage?.manuDetection
    ? {
        left: `${liveImage?.manuDetection.x1 * 100}%`,
        top: `${liveImage?.manuDetection.y1 * 100}%`,
        width: `${
          (liveImage?.manuDetection.x2 - liveImage?.manuDetection.x1) * 100
        }%`,
        height: `${
          (liveImage?.manuDetection.y2 - liveImage?.manuDetection.y1) * 100
        }%`,
      }
    : null;

  return (
    <>
      <div className="main-image">
        <img src={liveImage.file.mediaLink} />
        {manuAIBox && <div className="bounding-box" style={manuAIBox} />}
      </div>
      <style jsx>{`
        .main-image {
          width: 1024px;
          height: 768px;
          position: relative;
        }

        .bounding-box {
          position: absolute;
          border: 2px solid red;
        }
      `}</style>
    </>
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>ManuCam</title>
      </Head>
      <SWRProvider>
        <Live />
      </SWRProvider>
    </>
  );
}
