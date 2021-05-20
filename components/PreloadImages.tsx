import React from 'react';

import type { Image } from './useImages';

export const PreloadImages = ({ images }: { images: Array<Image> }) => {
  const [loadingCount, setLoadingCount] = React.useState(0);

  React.useEffect(() => {
    let canceled = false;

    const handleLoad = () => {
      if (canceled) {
        return;
      }

      setLoadingCount((c) => c + 1);
    };

    setLoadingCount(0);
    const imgElements = images.map((image) => {
      const img = new Image();
      img.onload = handleLoad;
      img.src = image.files.large.mediaLink;

      return img;
    });

    return () => {
      canceled = true;
      imgElements.forEach((img) => {
        img.src = null;
      });
    };
  }, [images]);

  return loadingCount < images.length ? (
    <li>
      Preloading {loadingCount}/{images.length}
    </li>
  ) : null;
};
