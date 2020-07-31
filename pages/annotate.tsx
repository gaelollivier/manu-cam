import Head from 'next/head';
import React from 'react';

import { SWRProvider } from '../components/SWRProvider';
import { Image, useImages } from '../lib/useImages';

interface Flag {
  image: Image;
  turtle: boolean;
}

const Images = () => {
  const localStorage =
    typeof window !== 'undefined'
      ? window.localStorage
      : { getItem: () => '', setItem: () => {} };

  const { images } = useImages('?limit=200');
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

  if (!images.length) {
    return <div>Loading...</div>;
  }

  if (flags.length === images.length) {
    return <div>DONE!</div>;
  }

  return (
    <>
      <div className="page">
        {currentImage && <img src={currentImage.files.large.mediaLink} />}
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
      <style jsx>{``}</style>
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
