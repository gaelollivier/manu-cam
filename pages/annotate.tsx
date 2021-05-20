import Head from 'next/head';
import React from 'react';

import { BoundingBoxAnnotationTool } from '../components/BoundingBoxAnnotationTool';
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
  loading,
  onNext,
  onPrev,
  onSave,
  onToggleHasManu,
}: {
  loading: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  onToggleHasManu: (_event: React.SyntheticEvent, hasManu?: boolean) => void;
}) => {
  React.useEffect(() => {
    const handler = (event) => {
      // Prevent changes on loading
      if (loading) {
        return;
      }
      // console.log(event.key);
      switch (event.key) {
        case 'n':
          // Mark "no manu" & go to next image
          onToggleHasManu(event, false);
          return onNext();
        // case 'Space':
        // case 'Enter':
        case 's':
          return onSave();
        case 'ArrowLeft':
          return onPrev();
        case 'ArrowRight':
          return onNext();
        case ' ':
          return onToggleHasManu(event);
        default:
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
};

const IMAGES_LIMIT = 100;

const Images = () => {
  const localStorage =
    typeof window !== 'undefined'
      ? window.localStorage
      : { getItem: () => '', setItem: () => {} };

  const [authToken, setAuthToken] = React.useState(
    localStorage.getItem('MANU_AUTH_TOKEN')
  );

  const [saveLoading, setSaveLoading] = React.useState(false);

  const [imagesOffset, setImagesOffset] = React.useState(0);

  const {
    images,
    totalCount,
    totalMissingAnnotations,
    revalidate,
    isValidating,
  } = useAnnotationImages(`?limit=${IMAGES_LIMIT}&offset=${imagesOffset}`);

  const loading = isValidating || saveLoading;

  const [currentImageOffset, setCurrentImageOffset] = React.useState<number>(0);

  const currentImage = images[currentImageOffset - imagesOffset];

  const [currentAnnotations, setCurrentAnnotations] = React.useState<
    Record<string, Image['annotations']>
  >({});

  // Show either local state or image state
  const currentImagesAnnotations = currentImage
    ? currentAnnotations[currentImage._id] ?? currentImage.annotations
    : null;

  const handleToggleHasManu = (
    _event: React.SyntheticEvent,
    hasManu?: boolean
  ) => {
    setCurrentAnnotations((current) => ({
      ...(current ?? {}),
      [currentImage._id]: {
        ...(currentImagesAnnotations ?? {}),
        hasManu:
          hasManu !== undefined ? hasManu : !currentImagesAnnotations?.hasManu,
      },
    }));
  };

  const handleNext = () => {
    if (currentImageOffset + 1 >= imagesOffset + IMAGES_LIMIT) {
      setImagesOffset((offset) => offset + IMAGES_LIMIT);
      setCurrentImageOffset(currentImageOffset + 1);
    } else {
      setCurrentImageOffset(currentImageOffset + 1);
    }
  };

  const handlePrev = () => {
    if (currentImageOffset <= 0) {
      return;
    }
    if (currentImageOffset - 1 < imagesOffset) {
      setImagesOffset((offset) => offset - IMAGES_LIMIT);
      setCurrentImageOffset(currentImageOffset - 1);
    } else {
      setCurrentImageOffset(currentImageOffset - 1);
    }
  };

  const handleSave = async () => {
    if (loading) {
      return;
    }

    setSaveLoading(true);
    const res = await fetch('/api/save-annotations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ annotations: currentAnnotations }),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error('save-annotations', { err });
      });
    console.log('save-annotations', { res });
    await revalidate();
    setCurrentAnnotations({});
    setSaveLoading(false);
  };

  useKeyboardHandlers({
    loading,
    onNext: handleNext,
    onPrev: handlePrev,
    onSave: handleSave,
    onToggleHasManu: handleToggleHasManu,
  });

  const { size: imageSize, ref: imageRef } = useElementSize<HTMLImageElement>();

  if (!images.length || !currentImage) {
    return <div>Loading...</div>;
  }

  const boxPosition = getBoxPosition({
    imageSize,
    boundingBox: currentImage.manuDetection,
  });

  return (
    <>
      <div className="page">
        <div className="image-container">
          <BoundingBoxAnnotationTool>
            <img
              key={currentImage._id}
              ref={imageRef}
              className="image"
              src={currentImage.files.large.mediaLink}
            />
          </BoundingBoxAnnotationTool>
          {boxPosition && <div className="bounding-box" style={boxPosition} />}
        </div>
        <div className="annotation-menu">
          <div className="actions">
            <ul>
              {currentImagesAnnotations ? (
                <>
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
                      {currentImagesAnnotations?.hasManu
                        ? 'HAS MANU'
                        : 'NO MANU'}
                    </button>
                  </li>
                </>
              ) : null}
              {loading ? <li>Loading...</li> : null}
            </ul>
          </div>
          <div className="info">
            <ul>
              <li>⬅️ ➡️ Prev / Next image</li>
              <li>[S]: Save</li>
              <li>To save: {Object.keys(currentAnnotations).length}</li>
              <li>
                Pagination: {currentImageOffset + 1} / {totalCount}
              </li>
              <li>Total missing annotations: {totalMissingAnnotations}</li>
              <li>
                Auth:{' '}
                <input
                  value={authToken}
                  onChange={(e) => {
                    setAuthToken(e.target.value);
                    localStorage.setItem('MANU_AUTH_TOKEN', e.target.value);
                  }}
                />
              </li>
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
