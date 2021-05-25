const fs = require('fs');

(async () => {
  const { images } = JSON.parse(
    fs.readFileSync(`${__dirname}/data/images-export.json`, {
      encoding: 'utf-8',
    })
  );

  console.log(
    images
      .filter(({ annotations }) => annotations?.boundingBoxes?.length > 0)
      .map(({ annotations }) => annotations.boundingBoxes[0])
  );
})();
