const fs = require('fs');
const sharp = require('sharp');
const request = require('request');

(async () => {
  const { images } = JSON.parse(
    fs.readFileSync(`${__dirname}/data/images-export.json`, {
      encoding: 'utf-8',
    })
  );

  const annotatedImages = images.filter(
    ({ annotations }) => annotations?.hasManu
  );

  let index = 0;

  for (const image of annotatedImages) {
    const filename = `${__dirname}/data/images/${image._id}.jpg`;

    await new Promise((resolve) =>
      request
        .get(image.files.large.mediaLink)
        // Resize to fix google cloud max image dimensions
        .pipe(sharp().resize({ width: 1024, height: 1024, fit: 'inside' }))
        .pipe(fs.createWriteStream(filename))
        .on('close', resolve)
    );

    console.log(`${++index}/${annotatedImages.length}`);
  }
})();
