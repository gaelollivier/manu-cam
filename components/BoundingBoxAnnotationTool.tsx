import React from 'react';

import { BoundingBox } from '../lib/boundingBox';

const getBoundingBox = (
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number },
  // if provided, normalizes bounding box
  imageSize?: null | { width: number; height: number }
) => {
  return {
    x1: Math.min(startPoint.x, endPoint.x) / (imageSize?.width || 1),
    y1: Math.min(startPoint.y, endPoint.y) / (imageSize?.height || 1),
    x2: Math.max(startPoint.x, endPoint.x) / (imageSize?.width || 1),
    y2: Math.max(startPoint.y, endPoint.y) / (imageSize?.height || 1),
  };
};

export const BoundingBoxAnnotationTool = ({
  children,
  onBoundingBox,
  imageSize,
}: {
  children: React.ReactNode;
  onBoundingBox: (boundingBox: BoundingBox) => void;
  imageSize: null | { width: number; height: number };
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const xGuideRef = React.useRef<HTMLDivElement>(null);
  const yGuideRef = React.useRef<HTMLDivElement>(null);
  const mousePositionRef = React.useRef({ x: 0, y: 0 });
  const [currentBoxStartPoint, setCurrentBoxStartPoint] =
    React.useState<null | { x: number; y: number }>(null);

  const getRelativeMousePos = () => {
    if (!containerRef.current) {
      return { x: 0, y: 0 };
    }

    return {
      x: mousePositionRef.current.x - containerRef.current.offsetLeft,
      y: mousePositionRef.current.y - containerRef.current.offsetTop,
    };
  };

  const handleMouseMove = React.useCallback((event: MouseEvent) => {
    // Note: we store mouse position in a ref so we don't update the div at every mouse move but
    // only on frame refresh
    mousePositionRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const drawBox = React.useCallback(() => {
    if (
      !containerRef.current ||
      !boxRef.current ||
      !xGuideRef.current ||
      !yGuideRef.current
    ) {
      window.requestAnimationFrame(drawBox);
      return;
    }

    const relativeMousePos = getRelativeMousePos();

    xGuideRef.current.style.top = `${relativeMousePos.y}px`;
    yGuideRef.current.style.left = `${relativeMousePos.x}px`;

    if (currentBoxStartPoint) {
      boxRef.current.style.display = 'block';
      const box = getBoundingBox(currentBoxStartPoint, relativeMousePos);
      boxRef.current.style.left = `${box.x1}px`;
      boxRef.current.style.top = `${box.y1}px`;
      boxRef.current.style.width = `${box.x2 - box.x1}px`;
      boxRef.current.style.height = `${box.y2 - box.y1}px`;
    } else {
      boxRef.current.style.display = 'none';
    }

    window.requestAnimationFrame(drawBox);
  }, [currentBoxStartPoint]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    document.addEventListener('mousemove', handleMouseMove);
    window.requestAnimationFrame(drawBox);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove, drawBox]);

  const handleClick = () => {
    if (!currentBoxStartPoint) {
      setCurrentBoxStartPoint(getRelativeMousePos());
    } else {
      onBoundingBox(
        getBoundingBox(currentBoxStartPoint, getRelativeMousePos(), imageSize)
      );
      setCurrentBoxStartPoint(null);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        cursor: 'crosshair',
        overflow: 'hidden',
      }}
      onClick={handleClick}
    >
      <div
        style={{
          position: 'absolute',
          outline: '2px solid red',
        }}
        ref={boxRef}
      ></div>
      <div
        style={{
          position: 'absolute',
          outline: '1px dashed grey',
          width: '100%',
        }}
        ref={xGuideRef}
      ></div>
      <div
        style={{
          position: 'absolute',
          outline: '1px dashed grey',
          height: '100%',
        }}
        ref={yGuideRef}
      ></div>
      {children}
    </div>
  );
};
