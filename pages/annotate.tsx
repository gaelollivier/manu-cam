import Head from 'next/head';
import React from 'react';

import { SWRProvider } from '../components/SWRProvider';
import { useElementSize } from '../lib/useElementSize';
import { Image, useImages } from '../lib/useImages';

interface Flag {
  image: Image;
  turtle: boolean;
}

const getBoxPosition = ({
  imageSize,
  boundingBox,
}: {
  imageSize: { width?: number; height?: number };
  boundingBox?: Image['manuDetection'];
}) => {
  return boundingBox?.score > 0.5 && imageSize.width && imageSize.height
    ? {
        left: `${boundingBox.x1 * imageSize.width}px`,
        top: `${boundingBox.y1 * imageSize.height}px`,
        width: `${(boundingBox.x2 - boundingBox.x1) * imageSize.width}px`,
        height: `${(boundingBox.y2 - boundingBox.y1) * imageSize.height}px`,
      }
    : null;
};

const Images = () => {
  const localStorage =
    typeof window !== 'undefined'
      ? window.localStorage
      : { getItem: () => '', setItem: () => {} };

  const { images } = useImages('?limit=200&hasManu=true');
  const [flags, setFlags] = React.useState<Array<Flag>>(
    JSON.parse(localStorage.getItem('FLAGS') || '[]')
  );

  const addFlag = (flag: Flag) => setFlags((current) => [...current, flag]);
  const removeFlag = () => setFlags((current) => current.slice(0, -1));

  const currentImage = images[flags.length];

  React.useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Backspace') {
        removeFlag();
        return;
      }

      if (event.key === 'Enter') {
        localStorage.setItem('FLAGS', JSON.stringify(flags));
        return;
      }

      if (!currentImage) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        addFlag({ image: currentImage, turtle: false });
      } else if (event.key === 'ArrowRight') {
        addFlag({ image: currentImage, turtle: true });
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [currentImage]);

  const { size: imageSize, ref: imageRef } = useElementSize<HTMLImageElement>();

  if (!images.length) {
    return <div>Loading...</div>;
  }

  if (flags.length === images.length) {
    return <div>DONE!</div>;
  }

  const boxPosition = getBoxPosition({
    imageSize,
    boundingBox: currentImage.manuDetection,
  });

  return (
    <>
      <div className="page">
        {currentImage && (
          <div className="image-container">
            <img
              ref={imageRef}
              className="image"
              src={currentImage.files.large.mediaLink}
            />
            {boxPosition && (
              <div className="bounding-box" style={boxPosition} />
            )}
          </div>
        )}
        <ul>
          <li>Left arrow key: No turtle in picture</li>
          <li>Right arrow key: Turtle in picture</li>
          <li>Delete key: Undo</li>
          <li>Remaining: {images.length - flags.length}</li>
        </ul>
        <ul>
          {[...flags].reverse().map((flag, index) => {
            return <li key={index}>{flag.turtle ? 'True' : 'False'}</li>;
          })}
        </ul>
      </div>
      <style jsx>{`
        .image-container {
          position: relative;
        }

        .image {
          max-height: calc(100vh - 145px);
        }

        .bounding-box {
          position: absolute;
          border: solid 2px red;
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
        <Images />
      </SWRProvider>
    </>
  );
}
