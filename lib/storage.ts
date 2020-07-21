import { Readable } from 'stream';

import { Storage } from '@google-cloud/storage';

export const uploadImage = async ({
  image,
  destination,
}: {
  image: Readable;
  destination: string;
}) => {
  const storage = new Storage({
    credentials: JSON.parse(
      Buffer.from(process.env.GCLOUD_CREDENTIALS, 'base64').toString()
    ),
  });

  // Create a new file
  const file = storage.bucket('manu-cam-images').file(destination);

  // Start upload
  // See: https://googleapis.dev/nodejs/storage/latest/File.html#createWriteStream
  await new Promise((resolve, reject) => {
    image
      .pipe(
        file.createWriteStream({
          gzip: true,
          metadata: { cacheControl: 'public, max-age=31536000' },
        })
      )
      .on('error', (err) => reject(err))
      .on('finish', () => resolve());
  });

  return file;
};
