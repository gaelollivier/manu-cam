import { runDbQuery } from './db';
import { uploadImage } from './storage';

export const saveImage = async (path: string, { time }: { time: Date }) => {
  // Store in YYYY/MM/DD/HH/mm/[size].jpg
  const folderPath = time.toISOString().substr(0, 16).replace(/[-T:]/g, '/');
  const destination = `${folderPath}/large.jpg`;

  const file = await uploadImage({ path, destination });

  const savedImage = await runDbQuery(async (db) => {
    return db.collection('images').insertOne({ time, file: file.metadata });
  });

  return { insertedId: savedImage.insertedId };
};
