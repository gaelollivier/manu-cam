import Head from 'next/head';
import React from 'react';

import { SWRProvider } from '../components/SWRProvider';
import { Image, useImages } from '../components/useImages';

const Images = () => {
  const [selectedHour, selectHour] = React.useState<string | null>(null);
  const [hasManu, setHasManu] = React.useState<boolean>(false);

  const params = [
    selectedHour && `hour=${selectedHour}`,
    hasManu && `hasManu=true`,
  ].filter(Boolean);

  const { images, imagesByHour } = useImages(
    params.length ? `?${params.join('&')}` : ''
  );
  const [selectedImage, selectImage] = React.useState<string | null>(null);

  const mainImage: Image | null =
    (selectedImage && images?.find(({ _id }) => _id === selectedImage)) ??
    images[0];

  const manuAIBox = mainImage?.manuDetection
    ? {
        left: `${mainImage?.manuDetection.x1 * 100}%`,
        top: `${mainImage?.manuDetection.y1 * 100}%`,
        width: `${
          (mainImage?.manuDetection.x2 - mainImage?.manuDetection.x1) * 100
        }%`,
        height: `${
          (mainImage?.manuDetection.y2 - mainImage?.manuDetection.y1) * 100
        }%`,
      }
    : null;

  return (
    <>
      <div className="page">
        <div className="container">
          <div className="main-view">
            {mainImage ? (
              <div className="main-image">
                <img src={mainImage.files.large.mediaLink} />
                {manuAIBox && (
                  <div className="bounding-box" style={manuAIBox} />
                )}
              </div>
            ) : (
              <div className="main-view loading">Loading...</div>
            )}
            <div className="main-image-time">
              <div>
                {mainImage?.time.toString().substr(0, 16).replace('T', ' ') ??
                  ''}
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={hasManu}
                    onChange={(event) => setHasManu(event.target.checked)}
                  />{' '}
                  Manu Only
                </label>
              </div>
            </div>
            <div className="hour-selector">
              <select
                value={selectedHour ?? imagesByHour[0]?.hour ?? ''}
                onChange={(event) => selectHour(event.target.value)}
              >
                {imagesByHour.map(({ hour, count }) => (
                  <option key={hour} value={hour}>
                    {hour} - {count}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="controls">
            <div className="images-scroller">
              {images.map(({ _id, files: { small } }) => (
                <img
                  className="thumbnail"
                  onMouseEnter={() => selectImage(_id)}
                  key={_id}
                  style={{ width: `${(100 / images.length).toFixed(2)}%` }}
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
          display: flex;
          align-items: center;
          justify-content: center;
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

        .bounding-box {
          position: absolute;
          border: 2px solid red;
        }

        .main-image {
          max-width: 100%;
          max-height: 100%;
          position: relative;
        }

        .main-image img {
          max-height: 70vh;
        }

        .controls {
          width: 100%;
          height: 150px;
          display: flex;
        }

        .images-scroller {
          width: 100%;
          display: flex;
        }

        .images-scroller .thumbnail {
          display: block;
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
