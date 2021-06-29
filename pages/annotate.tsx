import Head from 'next/head';
import React from 'react';

import {
  getBoundingBoxColor,
  useAnnotationControls,
} from '../components/annotate/useAnnotationControls';
import { useAnnotationSettings } from '../components/annotate/useAnnotationSettings';
import { useFiltersViews } from '../components/annotate/useFiltersViews';
import { useKeyboardHandlers } from '../components/annotate/useKeyboardHandlers';
import { usePagination } from '../components/annotate/usePagination';
import { BoundingBoxAnnotationTool } from '../components/BoundingBoxAnnotationTool';
import { ManuAI } from '../components/ManuAI';
import { PreloadImages } from '../components/PreloadImages';
import { SWRProvider } from '../components/SWRProvider';
import { useAuthToken } from '../components/useAuthToken';
import { useElementSize } from '../components/useElementSize';
import { BoundingBox, useAnnotationImages } from '../components/useImages';
import { isDefined } from '../lib/utils';

const getBoxStyle = ({
  imageSize,
  boundingBox,
  index,
}: {
  imageSize: null | { width: number; height: number };
  boundingBox?: BoundingBox;
  index?: number;
}) => {
  return boundingBox && imageSize
    ? {
        left: `${boundingBox.x1 * imageSize.width}px`,
        top: `${boundingBox.y1 * imageSize.height}px`,
        width: `${(boundingBox.x2 - boundingBox.x1) * imageSize.width}px`,
        height: `${(boundingBox.y2 - boundingBox.y1) * imageSize.height}px`,
        outlineColor: index != null ? getBoundingBoxColor(index) : 'red',
      }
    : null;
};

const Images = () => {
  const { authToken, authField } = useAuthToken();

  const [saveLoading, setSaveLoading] = React.useState(false);

  const {
    paginationParams,
    getCurrentImage,
    goToOffset,
    prevImage,
    nextImage,
    getPaginationControls,
  } = usePagination();

  const { filtersView, filtersViewControls } = useFiltersViews({ goToOffset });

  const { settingsControls, settings } = useAnnotationSettings();

  const { images, totalCount, revalidate, isValidating } = useAnnotationImages(
    `?${[paginationParams, `filtersView=${filtersView}`].join('&')}`
  );

  const loading = isValidating || saveLoading;

  const currentImage = getCurrentImage(images);

  const {
    currentAnnotations,
    resetCurrentAnnotations,
    imageAnnotationControls,
    annotatedBoundingBoxes,
    handleToggleHasManu,
    handleRemoveBoundingBox,
    handleNewBoundingBox,
  } = useAnnotationControls({
    currentImage,
    nextImage,
    autoNextOnBoundingBox: settings.autoNextOnBoundingBox,
  });

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
    if (filtersView !== '') {
      goToOffset(0);
    }
    await revalidate();
    resetCurrentAnnotations();
    setSaveLoading(false);
  };

  useKeyboardHandlers({
    loading,
    onNext: () => nextImage({ totalCount }),
    onPrev: prevImage,
    onSave: handleSave,
    onToggleHasManu: handleToggleHasManu,
    onRemoveBoundingBox: handleRemoveBoundingBox(),
  });

  const { size: imageSize, ref: imageRef } = useElementSize<HTMLImageElement>();

  const aiBox = getBoxStyle({
    imageSize,
    boundingBox: currentImage?.manuDetection,
  });

  const annotatedBoxes = annotatedBoundingBoxes
    .map((boundingBox, index) =>
      getBoxStyle({
        imageSize,
        boundingBox,
        index,
      })
    )
    .filter(isDefined);

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
                crossOrigin="anonymous"
              />
            </BoundingBoxAnnotationTool>
          ) : null}
          {settings.annotatedBox &&
            annotatedBoxes.map((annotatedBox, index) => (
              <div key={index} className="bounding-box" style={annotatedBox} />
            ))}
          {settings.aiBox && aiBox && (
            <div className="bounding-box ai-box" style={aiBox} />
          )}
        </div>
        <div className="annotation-menu">
          <div className="actions">
            <ul>
              {imageAnnotationControls ? (
                imageAnnotationControls
              ) : (
                <>
                  {currentImage ? (
                    <li>Use [SPACE] to toggle "Has Manu" flag</li>
                  ) : null}
                </>
              )}
              {currentImage ? (
                <li>
                  Current image:{' '}
                  {new Date(currentImage.time).toISOString().substr(0, 19)}
                </li>
              ) : null}
              {settingsControls}
              <ManuAI imageRef={imageRef} />
              <li>Filters: {filtersViewControls}</li>
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
              <li>Pagination: {getPaginationControls({ totalCount })}</li>
              <li>Auth: {authField}</li>
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
          max-height: calc(100vh - 10px);
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
