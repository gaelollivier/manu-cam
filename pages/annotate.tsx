import Head from 'next/head';
import React from 'react';

import { BoundingBoxAnnotationTool } from '../components/BoundingBoxAnnotationTool';
import { PreloadImages } from '../components/PreloadImages';
import { SWRProvider } from '../components/SWRProvider';
import { useElementSize } from '../components/useElementSize';
import {
  BoundingBox,
  Image,
  useAnnotationImages,
} from '../components/useImages';

const getBoxPosition = ({
  imageSize,
  boundingBox,
}: {
  imageSize: null | { width: number; height: number };
  boundingBox?: BoundingBox;
}) => {
  return boundingBox && imageSize
    ? {
        left: `${boundingBox.x1 * imageSize.width}px`,
        top: `${boundingBox.y1 * imageSize.height}px`,
        width: `${(boundingBox.x2 - boundingBox.x1) * imageSize.width}px`,
        height: `${(boundingBox.y2 - boundingBox.y1) * imageSize.height}px`,
      }
    : null;
};

const getRange = (start: number, end: number, increment: number) => {
  const res = [];
  for (let current = start; current <= end; current += increment) {
    res.push(current);
  }
  return res;
};

const useKeyboardHandlers = ({
  loading,
  onNext,
  onPrev,
  onSave,
  onToggleHasManu,
  onRemoveBoundingBox,
}: {
  loading: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  onToggleHasManu: (_event: Event, hasManu?: boolean) => void;
  onRemoveBoundingBox: (_event: Event) => void;
}) => {
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Prevent changes on loading
      if (loading) {
        return;
      }
      // console.log(event.key);
      switch (event.key) {
        case 'ArrowDown':
          // Mark "no manu" & go to next image
          onToggleHasManu(event, false);
          return onNext();
        case 'ArrowUp':
          // Mark "has manu" & go to next image
          onToggleHasManu(event, true);
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
        case 'Escape':
          return onRemoveBoundingBox(event);
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

  const [settings, setSettings] = React.useState({
    aiBox: false,
    annotatedBox: true,
    autoNextOnBoundingBox: false,
    filterMissingAnnotations: false,
    filterMissingBoundingBoxes: false,
  });

  const handleDisplaySettingToggle =
    (settingKey: keyof typeof settings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setSettings((settings) => ({
        ...settings,
        [settingKey]: checked,
      }));
    };

  const { images, totalCount, revalidate, isValidating } = useAnnotationImages(
    `?${[
      `limit=${IMAGES_LIMIT}`,
      `offset=${imagesOffset}`,
      `filterMissingAnnotations=${settings.filterMissingAnnotations}`,
      `filterMissingBoundingBoxes=${settings.filterMissingBoundingBoxes}`,
    ].join('&')}`
  );

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

  const handleToggleHasManu = (_event: Event, hasManu?: boolean) => {
    setCurrentAnnotations((current) => ({
      ...(current ?? {}),
      [currentImage._id]: {
        ...(currentImagesAnnotations ?? {}),
        hasManu:
          hasManu !== undefined ? hasManu : !currentImagesAnnotations?.hasManu,
      },
    }));
  };

  const handleNewBoundingBox = (bBox: BoundingBox) => {
    setCurrentAnnotations((current) => ({
      ...(current ?? {}),
      [currentImage._id]: {
        ...(currentImagesAnnotations ?? {}),
        // NOTE: For now, we only support a single box per frame. We can add support for adding/removing
        // of multiple boxes later
        boundingBoxes: [bBox],
      },
    }));
    if (settings.autoNextOnBoundingBox) {
      handleNext();
    }
  };

  const handleRemoveBoundingBox = () => {
    setCurrentAnnotations((current) => ({
      ...(current ?? {}),
      [currentImage._id]: {
        ...(currentImagesAnnotations ?? {}),
        boundingBoxes: [],
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

  const handleGoToOffset = (newOffset: number) => {
    setImagesOffset(newOffset);
    setCurrentImageOffset(newOffset);
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
    // If we use a filter, move back to image 0 after a save
    if (
      settings.filterMissingAnnotations ||
      settings.filterMissingAnnotations
    ) {
      handleGoToOffset(0);
    }
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
    onRemoveBoundingBox: handleRemoveBoundingBox,
  });

  const { size: imageSize, ref: imageRef } = useElementSize<HTMLImageElement>();

  const aiBox = getBoxPosition({
    imageSize,
    boundingBox: currentImage?.manuDetection,
  });

  const annotatedBox = getBoxPosition({
    imageSize,
    boundingBox: currentImagesAnnotations?.boundingBoxes?.[0],
  });

  return (
    <>
      <div className="page">
        <div className="image-container">
          {currentImage ? (
            <BoundingBoxAnnotationTool
              imageSize={imageSize}
              onBoundingBox={handleNewBoundingBox}
            >
              <img
                key={currentImage._id}
                ref={imageRef}
                className="image"
                src={currentImage.files.large.mediaLink}
              />
            </BoundingBoxAnnotationTool>
          ) : null}
          {settings.annotatedBox && annotatedBox && (
            <div className="bounding-box" style={annotatedBox} />
          )}
          {settings.aiBox && aiBox && (
            <div className="bounding-box ai-box" style={aiBox} />
          )}
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
                      onClick={(event) =>
                        handleToggleHasManu(event.nativeEvent)
                      }
                    >
                      {currentImagesAnnotations?.hasManu
                        ? 'HAS MANU'
                        : 'NO MANU'}
                    </button>
                  </li>
                  {currentImagesAnnotations.boundingBoxes?.length ? (
                    <li>
                      <button onClick={handleRemoveBoundingBox}>
                        Delete BoundingBox
                      </button>
                    </li>
                  ) : null}
                </>
              ) : (
                <>
                  {currentImage ? (
                    <li>Use [SPACE] to toggle "Has Manu" flag</li>
                  ) : null}
                </>
              )}
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.aiBox}
                    onChange={handleDisplaySettingToggle('aiBox')}
                  />{' '}
                  Show AI Box
                </label>
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.annotatedBox}
                    onChange={handleDisplaySettingToggle('annotatedBox')}
                  />{' '}
                  Show Annotated Box
                </label>
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoNextOnBoundingBox}
                    onChange={handleDisplaySettingToggle(
                      'autoNextOnBoundingBox'
                    )}
                  />{' '}
                  Auto Next on Bounding Box
                </label>
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.filterMissingAnnotations}
                    onChange={handleDisplaySettingToggle(
                      'filterMissingAnnotations'
                    )}
                  />{' '}
                  Filter for missing annotations
                </label>
              </li>
              <li>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.filterMissingBoundingBoxes}
                    onChange={handleDisplaySettingToggle(
                      'filterMissingBoundingBoxes'
                    )}
                  />{' '}
                  Filter for missing bounding box
                </label>
              </li>
              {loading ? <li>Loading...</li> : null}
              <PreloadImages images={images} />
            </ul>
          </div>
          <div className="info">
            <ul>
              <li>⬅️ ➡️ Prev / Next image</li>
              <li>⬇️ Mark as "No manu" and skip</li>
              <li>⬆️ Mark as "Has manu" and skip</li>
              <li>[SPACE]: Toggle "Has Manu"</li>
              <li>[ESC]: Remove Bounding Box</li>
              <li>[S]: Save</li>
              <li>To save: {Object.keys(currentAnnotations).length}</li>
              <li>
                Pagination: {currentImageOffset + 1} / {totalCount}{' '}
                <select
                  onChange={(e) => handleGoToOffset(Number(e.target.value))}
                  value={String(imagesOffset)}
                >
                  {getRange(
                    0,
                    totalCount - (totalCount % IMAGES_LIMIT),
                    IMAGES_LIMIT
                  ).map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </li>
              <li>
                Auth:{' '}
                <input
                  value={authToken ?? ''}
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

        button {
          margin: 2px 0px;
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
          outline: solid 2px red;
        }

        .ai-box {
          outline: solid 2px blue;
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
