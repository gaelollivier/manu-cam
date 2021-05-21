import { Db, MongoClient } from 'mongodb';

// based on https://github.com/vercel/next.js/blob/7035a036abb02af7aaee7a0a9ef545b91856a4eb/examples/with-mongodb/util/mongodb.js#L28

let cachedClient: Promise<Db> = (global as any).mongoClient;

export const getDb = (): Promise<Db> => {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .connect()
    .then((client) => client.db('manu_cam'));

  (global as any).mongoClient = cachedClient;
  return cachedClient;
};

export async function runDbQuery<Res>(
  fn: (db: Db) => Promise<Res>
): Promise<Res> {
  const db = await getDb();
  // NOTE: Previous implementation was closing the connection after the query, but this turned
  // out to be less efficient as opening a new connection every time is slow
  return fn(db);
}
