import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';

interface SaveAnnotationsBody {
  annotations: {
    [imageId: string]: {
      hasManu?: boolean;
      boundingBoxes?: Array<{
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      }>;
    };
  };
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  checkAuth(req);

  const startTime = Date.now();

  const { annotations } = req.body as SaveAnnotationsBody;

  console.log(`Saving new annotations: ${JSON.stringify(annotations)}`);

  await runDbQuery(async (db) => {
    const bulk = db.collection('images').initializeUnorderedBulkOp();

    Object.entries(annotations).forEach(([imageId, annotations]) => {
      bulk.find({ _id: new ObjectId(imageId) }).updateOne({
        $set: { annotations },
      });
    });

    if (bulk.length) {
      await bulk.execute();
    }
  });

  const endTime = Date.now();
  console.log(`[save-annotations] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ success: true });
};
