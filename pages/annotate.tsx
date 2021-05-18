import Head from 'next/head';
import React from 'react';

import { SWRProvider } from '../components/SWRProvider';
import { useElementSize } from '../lib/useElementSize';
import { Image, useAnnotationImages, useImages } from '../lib/useImages';

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

const useKeyboardHandlers = ({
  onNext,
  onPrev,
  onSave,
  onToggleHasManu,
}: {
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  onToggleHasManu: () => void;
}) => {
  React.useEffect(() => {
    const handler = (event) => {
      console.log(event.key);
      switch (event.key) {
        // case 'Backspace':
        // case 'Space':
        // case 'Enter':
        case 's':
          return onSave();
        case 'ArrowLeft':
          return onPrev();
        case 'ArrowRight':
          return onNext();
        case ' ':
          return onToggleHasManu();
        default:
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
};

const IMAGES_LIMIT = 20;

const Images = () => {
  const [imagesOffset, setImagesOffset] = React.useState(0);

  const { images, totalCount, totalMissingAnnotations } = useAnnotationImages(
    `?limit=${IMAGES_LIMIT}&offset=${imagesOffset}`
  );

  const [currentImage, setCurrentImage] = React.useState<Image | null>(null);

  const currentImageOffset = images.indexOf(currentImage);

  const [currentAnnotations, setCurrentAnnotations] = React.useState<
    Record<string, Image['annotations']>
  >({});

  const handleToggleHasManu = () => {
    setCurrentAnnotations((current) => ({
      ...(current ?? {}),
      [currentImage._id]: {
        ...(current[currentImage._id] ?? {}),
        hasManu: !current[currentImage._id]?.hasManu,
      },
    }));
  };

  useKeyboardHandlers({
    onNext: () => {
      const nextImageIndex = currentImageOffset + 1;
      if (nextImageIndex === images.length) {
        setImagesOffset((offset) => offset + IMAGES_LIMIT);
        setCurrentImage(null);
      } else {
        setCurrentImage(images[nextImageIndex]);
      }
    },
    onPrev: () => {
      const prevImageIndex = currentImageOffset - 1;
      if (prevImageIndex < 0) {
        setImagesOffset((offset) => Math.max(0, offset - IMAGES_LIMIT));
        setCurrentImage(null);
      } else {
        setCurrentImage(images[prevImageIndex]);
      }
    },
    onSave: () => {
      setCurrentAnnotations({});
    },
    onToggleHasManu: handleToggleHasManu,
  });

  // Initialize currentImage base on images
  React.useEffect(() => {
    if (!currentImage && images.length) {
      setCurrentImage(images[0]);
    }
  }, [currentImage, images]);

  const { size: imageSize, ref: imageRef } = useElementSize<HTMLImageElement>();

  if (!images.length || !currentImage) {
    return <div>Loading...</div>;
  }

  const boxPosition = getBoxPosition({
    imageSize,
    boundingBox: currentImage.manuDetection,
  });

  console.log(imageSize);

  // Show either local state or image state
  const currentImagesAnnotations =
    currentAnnotations[currentImage._id] ?? currentImage.annotations;

  return (
    <>
      <div className="page">
        <div className="image-container">
          <img
            key={currentImage._id}
            ref={imageRef}
            className="image"
            src={currentImage.files.large.mediaLink}
          />
          {boxPosition && <div className="bounding-box" style={boxPosition} />}
        </div>
        <div className="annotation-menu">
          <div className="actions">
            <ul>
              <li>
                <button
                  style={{
                    color: 'white',
                    backgroundColor: currentImagesAnnotations?.hasManu
                      ? '#52aa4f'
                      : '#bd4747',
                  }}
                  onClick={handleToggleHasManu}
                >
                  {currentImagesAnnotations?.hasManu ? 'HAS MANU' : 'NO MANU'}
                </button>
              </li>
            </ul>
          </div>
          <div className="info">
            <ul>
              <li>⬅️ ➡️ Prev / Next image</li>
              <li>[S]: Save</li>
              <li>To save: {Object.keys(currentAnnotations).length}</li>
              <li>
                Pagination: {imagesOffset + currentImageOffset} / {totalCount}
              </li>
              <li>Total missing annotations: {totalMissingAnnotations}</li>
            </ul>
          </div>
        </div>
      </div>
      <style jsx>{`
        .page {
          display: flex;
          height: 100vh;
        }

        ul {
          padding-left: 12px;
          margin-bottom: 12px;
        }

        .image-container {
          flex: 1;
          position: relative;
        }

        .image {
          max-height: 100vh;
        }

        .bounding-box {
          position: absolute;
          border: solid 2px red;
        }

        .annotation-menu {
          display: flex;
          flex-direction: column;
          min-width: 400px;
        }

        .annotation-menu .actions {
          flex: 1;
        }

        .annotation-menu .actions button {
          border: none;
          border-radius: 3px;
          padding: 8px;
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
