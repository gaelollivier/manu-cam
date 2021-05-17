import React from 'react';

export function useElementSize<ElementType extends HTMLElement>() {
  const ref = React.useRef<ElementType>();
  const obs = React.useRef<ResizeObserver>();
  const [size, setSize] = React.useState({ width: null, height: null });

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }

    const clientRect = ref.current.getBoundingClientRect();
    if (clientRect.width !== size.width || clientRect.height !== size.height) {
      setSize({
        width: clientRect.width,
        height: clientRect.height,
      });
    }
  });

  return { ref, size };
}
