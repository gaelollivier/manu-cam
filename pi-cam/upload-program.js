const { MongoClient } = require('mongodb');
const fs = require('fs');

const programPath = `${__dirname}/pi-program`;

(async () => {
  const client = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();

  const latestProgram = await client
    .db('manu_cam')
    .collection('pi-program')
    .findOne();
  const newVersion = ((latestProgram && latestProgram.version) || 0) + 1;

  const files = fs.readdirSync(programPath);
  const programFiles = files.map((filename) => {
    const content = fs.readFileSync(`${programPath}/${filename}`, {
      encoding: 'utf-8',
    });
    return {
      filename,
      content,
    };
  });

  await client
    .db('manu_cam')
    .collection('pi-program')
    .updateMany(
      {},
      {
        $set: {
          files: programFiles,
          version: newVersion,
        },
      }
    );

  await client.close();
})();
