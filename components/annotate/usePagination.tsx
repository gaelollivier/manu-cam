import React from 'react';

import { Image } from '../useImages';

const IMAGES_LIMIT = 100;

const getRange = (start: number, end: number, increment: number) => {
  const res = [];
  for (let current = start; current <= end; current += increment) {
    res.push(current);
  }
  return res;
};

export const usePagination = () => {
  // Page offset
  const [imagesOffset, setImagesOffset] = React.useState(0);

  // Current image offset within all images
  const [currentImageOffset, setCurrentImageOffset] = React.useState<number>(0);

  const paginationParams = [
    `limit=${IMAGES_LIMIT}`,
    `offset=${imagesOffset}`,
  ].join('&');

  const getCurrentImage = (images: Array<Image>) => {
    return images[currentImageOffset - imagesOffset];
  };

  const goToOffset = (newOffset: number) => {
    setImagesOffset(newOffset);
    setCurrentImageOffset(newOffset);
  };

  const nextImage = ({ totalCount }: { totalCount?: number } = {}) => {
    if (totalCount != null && currentImageOffset + 1 >= totalCount) {
      return;
    }
    if (currentImageOffset + 1 >= imagesOffset + IMAGES_LIMIT) {
      setImagesOffset((offset) => offset + IMAGES_LIMIT);
      setCurrentImageOffset(currentImageOffset + 1);
    } else {
      setCurrentImageOffset(currentImageOffset + 1);
    }
  };

  const prevImage = () => {
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

  const getPaginationControls = ({ totalCount }: { totalCount: number }) => (
    <>
      {currentImageOffset + 1} / {totalCount}{' '}
      <select
        onChange={(e) => goToOffset(Number(e.target.value))}
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
    </>
  );

  return {
    currentImageOffset,
    paginationParams,
    getCurrentImage,
    goToOffset,
    prevImage,
    nextImage,
    getPaginationControls,
  };
};
