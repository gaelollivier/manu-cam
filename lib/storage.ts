import { Storage } from '@google-cloud/storage';

export const uploadImage = async (path: string) => {
  const storage = new Storage({
    credentials: JSON.parse(
      new Buffer(process.env.GCLOUD_CREDENTIALS, 'base64').toString()
    ),
  });

  const [file] = await storage.bucket('manu-cam-images').upload(path, {
    gzip: true,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });

  return file;
};
