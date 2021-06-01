import React from 'react';

import { BoundingBox, Image } from '../useImages';

export const useAnnotationControls = ({
  currentImage,
  nextImage,
  autoNextOnBoundingBox,
}: {
  currentImage?: Image;
  nextImage: () => void;
  autoNextOnBoundingBox?: boolean;
}) => {
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
      [currentImage?._id ?? '']: {
        ...(currentImagesAnnotations ?? {}),
        hasManu:
          hasManu !== undefined ? hasManu : !currentImagesAnnotations?.hasManu,
      },
    }));
  };

  const handleToggleSkipped = (_event: Event) => {
    const newValue = !(
      currentAnnotations[currentImage?._id ?? ''] ?? currentImagesAnnotations
    )?.skipped;
    setCurrentAnnotations((current) => ({
      ...(current ?? {}),
      [currentImage?._id ?? '']: {
        ...(currentImagesAnnotations ?? {}),
        skipped: newValue,
      },
    }));
    if (newValue) {
      // Automatically move to next when skipping
      nextImage();
    }
  };

  const handleNewBoundingBox = (bBox: BoundingBox) => {
    setCurrentAnnotations((current) => ({
      ...(current ?? {}),
      [currentImage?._id ?? '']: {
        ...(currentImagesAnnotations ?? {}),
        // NOTE: For now, we only support a single box per frame. We can add support for adding/removing
        // of multiple boxes later
        boundingBoxes: [bBox],
      },
    }));
    if (autoNextOnBoundingBox) {
      nextImage();
    }
  };

  const handleRemoveBoundingBox = () => {
    setCurrentAnnotations((current) => ({
      ...(current ?? {}),
      [currentImage?._id ?? '']: {
        ...(currentImagesAnnotations ?? {}),
        boundingBoxes: [],
      },
    }));
  };

  const imageAnnotationControls = currentImagesAnnotations ? (
    <>
      <li>
        <button
          style={{
            color: 'white',
            backgroundColor: currentImagesAnnotations.hasManu
              ? '#52aa4f'
              : '#bd4747',
          }}
          onClick={(event) => handleToggleHasManu(event.nativeEvent)}
        >
          {currentImagesAnnotations?.hasManu ? 'HAS MANU' : 'NO MANU'}
        </button>
        <button onClick={(event) => handleToggleSkipped(event.nativeEvent)}>
          {currentImagesAnnotations?.skipped ? 'SKIPPED' : 'NOT SKIPPED'}
        </button>
      </li>
      {currentImagesAnnotations.boundingBoxes?.length ? (
        <li>
          <button onClick={handleRemoveBoundingBox}>Delete BoundingBox</button>
        </li>
      ) : null}
      <style jsx>{`
        button {
          margin: 2px;
          border: none;
          border-radius: 3px;
          padding: 8px;
        }
      `}</style>
    </>
  ) : null;

  const annotatedBoundingBoxes = currentImagesAnnotations?.boundingBoxes ?? [];

  return {
    currentAnnotations,
    resetCurrentAnnotations: () => setCurrentAnnotations({}),
    handleToggleHasManu,
    handleRemoveBoundingBox,
    imageAnnotationControls,
    annotatedBoundingBoxes,
    handleNewBoundingBox,
  };
};
