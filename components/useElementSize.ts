import React from 'react';

export function useElementSize<ElementType extends HTMLElement>() {
  const ref = React.useRef<ElementType>(null);
  const [size, setSize] =
    React.useState<null | { width: number; height: number }>(null);

  const updateState = (element?: null | ElementType) => {
    if (!element) {
      return;
    }

    const clientRect = element.getBoundingClientRect();
    if (
      clientRect.width !== size?.width ||
      clientRect.height !== size?.height
    ) {
      setSize({
        width: clientRect.width,
        height: clientRect.height,
      });
    }
  };

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (ref.current instanceof HTMLImageElement) {
      ref.current.onload = () => {
        updateState(ref.current);
      };
    }

    updateState(ref.current);
  });

  return { ref, size };
}
