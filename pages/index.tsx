import Head from 'next/head';
import React from 'react';

import { SWRProvider } from '../components/SWRProvider';
import { Image, useImages } from '../lib/useImages';

const Images = () => {
  const { images, imagesByHour } = useImages();
  const [selectedImage, selectImage] = React.useState<string | null>(null);
  const [selectedHour, selectHour] = React.useState<string | null>(null);

  const mainImage: Image | null =
    (selectedImage && images?.find(({ _id }) => _id === selectedImage)) ??
    images[0];

  console.log(selectedHour);

  return (
    <>
      <div className="page">
        <div className="container">
          <div className="main-view">
            {mainImage ? (
              <>
                <div className="main-image-time">
                  <div>
                    {mainImage.time.toString().substr(0, 16).replace('T', ' ')}
                  </div>
                  <div>{mainImage._id}</div>
                </div>
                <div className="hour-selector">
                  <select onChange={(event) => selectHour(event.target.value)}>
                    {imagesByHour.map(({ hour, count }) => (
                      <option value={hour}>
                        {hour} - {count}
                      </option>
                    ))}
                  </select>
                </div>
                <img
                  className="main-image"
                  src={mainImage.files.large.mediaLink}
                />
              </>
            ) : (
              <div className="main-view loading">Loading...</div>
            )}
          </div>
          <div className="controls">
            <div className="images-scroller">
              {images.map(({ _id, files: { small } }) => (
                <img
                  onMouseEnter={() => selectImage(_id)}
                  key={_id}
                  src={small.mediaLink}
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
          width: 90vw;
          height: 90vh;
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

        .main-view.loading {
          text-align: center;
          padding-top: 60px;
        }

        .main-image-time {
          position: absolute;
          top: 5px;
          left: 5px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 5px;
          padding: 5px;
        }

        .hour-selector select {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 5px;
          padding: 5px;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }

        .hour-selector select:focus {
          outline: none;
        }

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
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
