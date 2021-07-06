import React from 'react';

import { BoundingBox, getBoundingBoxColor } from '../BoundingBoxes';
import { Image } from '../useImages';

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

  const handleNewBoundingBox = (box: BoundingBox) => {
    setCurrentAnnotations((current) => ({
      ...(current ?? {}),
      [currentImage?._id ?? '']: {
        ...(currentImagesAnnotations ?? {}),
        boundingBoxes: [
          ...(currentImagesAnnotations?.boundingBoxes ?? []),
          box,
        ],
      },
    }));
    if (autoNextOnBoundingBox) {
      nextImage();
    }
  };

  const handleRemoveBoundingBox = (boxToRemove?: BoundingBox) => () => {
    setCurrentAnnotations((current) => {
      const currentBoundingBoxes =
        currentImagesAnnotations?.boundingBoxes ?? [];

      return {
        ...(current ?? {}),
        [currentImage?._id ?? '']: {
          ...(currentImagesAnnotations ?? {}),
          boundingBoxes: boxToRemove
            ? currentBoundingBoxes.filter((box) => box !== boxToRemove)
            : currentBoundingBoxes.slice(0, -1),
        },
      };
    });
  };

  const annotatedBoundingBoxes = currentImagesAnnotations?.boundingBoxes ?? [];

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
          Bounding Boxes:
          {currentImagesAnnotations.boundingBoxes?.map((boundingBox, index) => (
            <button
              key={index}
              onClick={handleRemoveBoundingBox(boundingBox)}
              style={{ backgroundColor: getBoundingBoxColor(index) }}
            >
              x
            </button>
          ))}
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
