import React from 'react';

const getBoundingBox = (
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number }
) => {
  return {
    x1: Math.min(startPoint.x, endPoint.x),
    y1: Math.min(startPoint.y, endPoint.y),
    x2: Math.max(startPoint.x, endPoint.x),
    y2: Math.max(startPoint.y, endPoint.y),
  };
};

export const BoundingBoxAnnotationTool = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const xGuideRef = React.useRef<HTMLDivElement>(null);
  const yGuideRef = React.useRef<HTMLDivElement>(null);
  const mousePositionRef = React.useRef({ x: 0, y: 0 });
  const [currentBoxStartPoint, setCurrentBoxStartPoint] =
    React.useState<{ x: number; y: number }>(null);

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
    if (!containerRef.current || !boxRef.current) {
      window.requestAnimationFrame(drawBox);
      return;
    }

    const relativeMousePos = getRelativeMousePos();

    xGuideRef.current.style.top = `${relativeMousePos.y}px`;
    yGuideRef.current.style.left = `${relativeMousePos.x}px`;

    if (currentBoxStartPoint) {
      boxRef.current.style.display = 'block';
      const bBox = getBoundingBox(currentBoxStartPoint, relativeMousePos);
      boxRef.current.style.left = `${bBox.x1}px`;
      boxRef.current.style.top = `${bBox.y1}px`;
      boxRef.current.style.width = `${bBox.x2 - bBox.x1}px`;
      boxRef.current.style.height = `${bBox.y2 - bBox.y1}px`;
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
      document.removeEventListener('mousemouve', handleMouseMove);
    };
  }, [handleMouseMove, drawBox]);

  const handleClick = () => {
    if (!currentBoxStartPoint) {
      setCurrentBoxStartPoint(getRelativeMousePos());
    } else {
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
