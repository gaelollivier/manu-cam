import Head from 'next/head';
import React from 'react';
import useSWR, { SWRConfig } from 'swr';

interface File {
  name: string;
  mediaLink: string;
}

interface Image {
  _id: string;
  time: Date;
  files: {
    small: File;
    large: File;
  };
}

const useImages = (): { images: Array<Image> } => {
  const { data } = useSWR('/api/images', {
    onSuccess: (data) => {
      console.log({ data });
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  return { images: data?.images ?? [] };
};

const Images = () => {
  const { images } = useImages();
  const [selectedImage, selectImage] = React.useState<string | null>(null);

  const mainImage: Image | null =
    (selectedImage && images?.find(({ _id }) => _id === selectedImage)) ??
    images[0];

  return (
    <>
      <div className="page">
        <div className="container">
          <div className="main-view">
            {mainImage && (
              <>
                <div className="main-image-time">
                  {mainImage.time.toString().substr(0, 16).replace('T', ' ')}
                </div>
                <img
                  className="main-image"
                  src={`https://storage.googleapis.com/manu-cam-images/${mainImage.files.large.name}`}
                />
              </>
            )}
          </div>
          <div className="controls">
            <div className="images-scroller">
              {images.map(({ _id, files: { small } }) => (
                <img
                  onMouseEnter={() => selectImage(_id)}
                  key={_id}
                  src={`https://storage.googleapis.com/manu-cam-images/${small.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .page {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .container {
          border-radius: 15px;
          width: 80vw;
          height: 80vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0px 20px 38px 2px rgba(163, 163, 163, 0.59);
        }

        .main-view {
          width: 100%;
          height: calc(100% - 150px);
          position: relative;
        }

        .main-image-time {
          position: absolute;
          top: 5px;
          left: 5px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 5px;
          padding: 5px;
        }

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .controls {
          width: 100%;
          height: 150px;
          display: flex;
        }

        .images-scroller {
          flex: 1;
          display: flex;
          overflow-x: auto;
        }

        .images-scroller img {
          height: 100%;
        }
      `}</style>
    </>
  );
};

export default function Home() {
  const authToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('MANUCAM_AUTH')
      : '';

  return (
    <>
      <Head>
        <title>ManuCam</title>
      </Head>
      <SWRConfig
        value={{
          fetcher: (input: RequestInfo, init?: RequestInit) =>
            fetch(input, {
              ...(init ?? {}),
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }).then((res) => res.json()),
        }}
      >
        <Images />
      </SWRConfig>
    </>
  );
}
