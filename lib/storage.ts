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
  await new Promise<void>((resolve, reject) => {
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

export const getImage = async (imageName: string): Promise<Buffer> => {
  const storage = new Storage({
    credentials: JSON.parse(
      Buffer.from(process.env.GCLOUD_CREDENTIALS, 'base64').toString()
    ),
  });

  return new Promise((resolve, reject) => {
    const buffers: Array<Buffer> = [];

    storage
      .bucket('manu-cam-images')
      .file(imageName)
      .createReadStream()
      .on('error', reject)
      .on('end', () => {
        resolve(Buffer.concat(buffers));
      })
      .on('data', (data) => buffers.push(data));
  });
};
