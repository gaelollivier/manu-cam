import Head from 'next/head';
import * as React from 'react';
import useSWR from 'swr';

import { BoundingBoxes } from '../components/BoundingBoxes';
import { SWRProvider } from '../components/SWRProvider';
import { useElementSize } from '../components/useElementSize';
import { File, Image } from '../components/useImages';

const Live = () => {
  const { data } = useSWR(`/api/live`, {
    refreshInterval: 500,
  });

  const { size: imageSize, ref: imageRef } = useElementSize<HTMLImageElement>();

  const liveImage: { file: File; objectDetection?: Image['objectDetection'] } =
    data?.liveImage;

  if (!liveImage) {
    return null;
  }

  return (
    <>
      <div className="main-image">
        <img
          ref={imageRef}
          width="1024"
          height="768"
          src={`https://storage.googleapis.com/manu-cam-images/live/latest-image.jpg?key=${Math.random()}`}
        />
        <BoundingBoxes
          boundingBoxes={liveImage?.objectDetection ?? []}
          imageSize={imageSize}
        />
      </div>
      <style jsx>{`
        .main-image {
          width: 1024px;
          height: 768px;
          position: relative;
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
