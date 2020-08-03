import Head from 'next/head';
import React from 'react';

import { SWRProvider } from '../components/SWRProvider';
import { Image, useImages } from '../lib/useImages';

const IMAGE_WIDTH = 2028;
const IMAGE_HEIGHT = 1520;

const Images = () => {
  const [selectedHour, selectHour] = React.useState<string | null>(
    '2020-07-31 12:00'
  );
  const { images, imagesByHour } = useImages(
    selectedHour ? `?hour=${selectedHour}` : ''
  );
  const [selectedImage, selectImage] = React.useState<string | null>(null);
  const [manuAIResult, setManuAIResult] = React.useState<any>(null);

  const runManuAI = async (imageId: string) => {
    const res = await fetch(`/api/manu-ai?imageId=${imageId}`).then((r) =>
      r.json()
    );
    const detectionResult = res.detectionResult[0];
    if (!detectionResult) {
      return;
    }
    setManuAIResult({
      box: {
        top: (detectionResult.box.top / IMAGE_HEIGHT) * 100,
        left: (detectionResult.box.left / IMAGE_WIDTH) * 100,
        width: (detectionResult.box.width / IMAGE_WIDTH) * 100,
        height: (detectionResult.box.height / IMAGE_HEIGHT) * 100,
      },
    });
  };

  const mainImage: Image | null =
    (selectedImage && images?.find(({ _id }) => _id === selectedImage)) ??
    images[0];

  console.log({ manuAIResult });

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
                  <div>
                    <button
                      className="manu-ai-button"
                      onClick={() => runManuAI(mainImage._id)}
                    >
                      MANU AI
                    </button>
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
                <img
                  className="main-image"
                  src={mainImage.files.large.mediaLink}
                />
              </>
            ) : (
              <div className="main-view loading">Loading...</div>
            )}
            {manuAIResult && (
              <div
                className="bounding-box"
                style={{
                  top: `${manuAIResult.box.top}%`,
                  left: `${manuAIResult.box.left}%`,
                  width: `${manuAIResult.box.width}%`,
                  height: `${manuAIResult.box.height}%`,
                }}
              />
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

        .manu-ai-button {
          cursor: pointer;
        }

        .bounding-box {
          position: absolute;
          border: 2px solid red;
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
