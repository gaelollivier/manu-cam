import Head from 'next/head';
import React from 'react';

import { useAnnotationControls } from '../components/annotate/useAnnotationControls';
import { useAnnotationSettings } from '../components/annotate/useAnnotationSettings';
import { useFiltersViews } from '../components/annotate/useFiltersViews';
import { useKeyboardHandlers } from '../components/annotate/useKeyboardHandlers';
import { usePagination } from '../components/annotate/usePagination';
import { BoundingBoxAnnotationTool } from '../components/BoundingBoxAnnotationTool';
import { BoundingBoxes } from '../components/BoundingBoxes';
import { PreloadImages } from '../components/PreloadImages';
import { SWRProvider } from '../components/SWRProvider';
import { useAuthToken } from '../components/useAuthToken';
import { useElementSize } from '../components/useElementSize';
import { useAnnotationImages } from '../components/useImages';
import { useManuAI } from '../components/useManuAI';
import { isDefined } from '../lib/utils';

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

  const currentImage = getCurrentImage(images);

  const { size: imageSize, ref: imageRef } = useElementSize<HTMLImageElement>();

  const { manuAIButton, manuAIDetectedBoxes, resetManuAiBoxes } = useManuAI({
    imageRef,
  });

  const loading = isValidating || saveLoading;

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
    onNext: () => {
      nextImage({ totalCount });
      resetManuAiBoxes();
    },
    onPrev: prevImage,
    onSave: handleSave,
    onToggleHasManu: handleToggleHasManu,
    onRemoveBoundingBox: handleRemoveBoundingBox(),
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
                crossOrigin="anonymous"
              />
            </BoundingBoxAnnotationTool>
          ) : null}
          {settings.annotatedBox && (
            <BoundingBoxes
              // NOTE: This should be refactored so that annotations have their own label
              boundingBoxes={annotatedBoundingBoxes.map((box) => ({
                box,
                label: '',
                score: 0,
              }))}
              imageSize={imageSize}
            />
          )}
          {settings.aiBox && (
            <BoundingBoxes
              boundingBoxes={manuAIDetectedBoxes}
              imageSize={imageSize}
              // Use a different index than annotated box, to get different colors
              colorOffset={1}
            />
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
              <li>Filters: {filtersViewControls}</li>
              <li>{manuAIButton}</li>
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
