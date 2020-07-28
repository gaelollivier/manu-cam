import Head from 'next/head';
import * as React from 'react';

export default function Home() {
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    const timeout = setInterval(() => {
      setKey((k) => k + 1);
    }, 500);
    return () => clearInterval(timeout);
  }, []);

  return (
    <>
      <Head>
        <title>ManuCam</title>
      </Head>
      <img
        src={`https://storage.googleapis.com/manu-cam-images/live/latest-image.jpg?key=${
          Math.random() + key
        }`}
      />
    </>
  );
}
