export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const BOUNDING_BOXES_COLORS = ['red', '#00FF00', 'blue', 'yellow'];

export const getBoundingBoxColor = (boxIndex: number) =>
  BOUNDING_BOXES_COLORS[boxIndex % BOUNDING_BOXES_COLORS.length];

export const BoundingBoxes = ({
  boundingBoxes,
  imageSize,
  colorOffset = 0,
}: {
  boundingBoxes: Array<{ score: number; label: string; box: BoundingBox }>;
  imageSize: null | { width: number; height: number };
  colorOffset?: number;
}) => {
  return imageSize ? (
    <>
      {boundingBoxes.map(({ box, score }, index) => {
        const style = {
          left: `${box.x1 * imageSize.width}px`,
          top: `${box.y1 * imageSize.height}px`,
          width: `${(box.x2 - box.x1) * imageSize.width}px`,
          height: `${(box.y2 - box.y1) * imageSize.height}px`,
          outlineColor: getBoundingBoxColor(index + colorOffset),
        };

        return (
          <div
            key={index}
            className={`bounding-box ${score ? 'labeled' : ''}`}
            style={style}
            data-label={score ? score.toFixed(3) : ''}
          />
        );
      })}
      <style jsx>{`
        .bounding-box {
          position: absolute;
          outline: solid 2px red;
        }

        .bounding-box.labeled::before {
          content: attr(data-label);
          font-size: 12px;
          line-height: 12px;
          background: #fff;
          position: absolute;
          top: 0;
        }
      `}</style>
    </>
  ) : null;
};
