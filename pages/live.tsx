import Head from 'next/head';
import * as React from 'react';
import useSWR from 'swr';

import { SWRProvider } from '../components/SWRProvider';
import { File, Image } from '../components/useImages';

const Live = () => {
  const { data } = useSWR(`/api/live`, {
    refreshInterval: 500,
  });

  const liveImage: { file: File; manuDetection?: Image['manuDetection'] } =
    data?.liveImage;

  if (!liveImage) {
    return null;
  }

  const manuAIBox =
    liveImage?.manuDetection?.score > 0.5
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
        <img
          width="1024"
          height="768"
          src={`https://storage.googleapis.com/manu-cam-images/live/latest-image.jpg?key=${Math.random()}`}
        />
        {manuAIBox && <div className="bounding-box" style={manuAIBox} />}
      </div>
      <pre>{JSON.stringify(liveImage?.manuDetection, null, 4)}</pre>
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
