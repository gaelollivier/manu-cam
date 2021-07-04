export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const BOUNDING_BOXES_COLORS = ['red', '#00FF00', 'blue', 'yellow'];

export const getBoundingBoxColor = (boxIndex: number) =>
  BOUNDING_BOXES_COLORS[boxIndex % BOUNDING_BOXES_COLORS.length];

export const getBoxStyle = ({
  imageSize,
  boundingBox,
  index,
}: {
  imageSize: null | { width: number; height: number };
  boundingBox?: BoundingBox;
  index?: number;
}) => {
  return boundingBox && imageSize
    ? {
        left: `${boundingBox.x1 * imageSize.width}px`,
        top: `${boundingBox.y1 * imageSize.height}px`,
        width: `${(boundingBox.x2 - boundingBox.x1) * imageSize.width}px`,
        height: `${(boundingBox.y2 - boundingBox.y1) * imageSize.height}px`,
        outlineColor: index != null ? getBoundingBoxColor(index) : 'red',
      }
    : null;
};
