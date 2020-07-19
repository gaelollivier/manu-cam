import { Db, MongoClient } from 'mongodb';

export async function runDbQuery<Res>(
  fn: (db: Db) => Promise<Res>
): Promise<Res> {
  const client = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  try {
    const res = await fn(client.db('manu_cam'));
    await client.close();
    return res;
  } catch (err) {
    await client.close();
    throw err;
  }
}
