import sharp, { ResizeOptions } from 'sharp';

import { runDbQuery } from './db';
import { uploadImage } from './storage';

// Half-size of Raspberry camera
const LARGE_FORMAT: ResizeOptions = {
  width: 2028,
  height: 1520,
};

// Miniature format for fast seeking
const SMALL_FORMAT: ResizeOptions = {
  width: 101,
  height: 76,
};

export const saveImage = async (path: string, { time }: { time: Date }) => {
  // Store in YYYY/MM/DD/HH/mm_[size].jpg
  const folderPath = time.toISOString().substr(0, 16).replace(/[-T:]/g, '/');

  const files = await Promise.all(
    [
      {
        format: 'large',
        image: sharp(path).resize(LARGE_FORMAT).jpeg(),
      },
      {
        format: 'small',
        image: sharp(path).resize(SMALL_FORMAT).jpeg(),
      },
    ].map(async ({ format, image }) => {
      const file = await uploadImage({
        image,
        destination: `${folderPath}_${format}.jpg`,
      });
      return { format, file };
    })
  );

  const metadataByFormat = files.reduce<{ [format: string]: object }>(
    (acc, { file, format }) => ({
      ...acc,
      [format]: file.metadata,
    }),
    {}
  );

  const savedImage = await runDbQuery(async (db) => {
    return db.collection('images').insertOne({ time, files: metadataByFormat });
  });

  return { insertedId: savedImage.insertedId };
};
