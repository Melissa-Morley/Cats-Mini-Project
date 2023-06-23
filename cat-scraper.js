const axios = require("axios");
const fs = require("fs");
const path = require("path");

const createDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
};

const downloadImage = async (imageUrl, filePath) => {
  const response = await axios.get(imageUrl, { responseType: "stream" });
  response.data.pipe(fs.createWriteStream(filePath));
  return new Promise((resolve, reject) => {
    response.data.on("end", () => resolve());
    response.data.on("error", (err) => reject(err));
  });
};

const scrapeCatImages = async (outputDirectory, limit) => {
  try {
    createDirectory(outputDirectory);

    // Check if the directory is empty
    const files = fs.readdirSync(outputDirectory);
    if (files.length > 0) {
      console.error(
        "Output directory is not empty. Please choose an empty directory."
      );
      process.exit(1);
    }

    //switched to thecatapi since cataas wasn't working
    const apiUrl = "https://api.thecatapi.com/v1/images/search";
    const imagePromises = [];

    for (let i = 0; i < limit; i++) {
      const response = await axios.get(apiUrl);
      const imageUrl = response.data[0].url;
      const filename = `cat-${i + 1}.jpg`;
      const filePath = path.join(outputDirectory, filename);
      imagePromises.push(downloadImage(imageUrl, filePath));
    }

    await Promise.all(imagePromises);
    console.log(
      `Successfully downloaded ${limit} cat images! They are saved in the "${outputDirectory}" directory.`
    );
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error("Please provide two arguments: <output directory> <limit>");
  process.exit(1);
}

const outputDirectory = args[0];
const limit = parseInt(args[1]);

scrapeCatImages(outputDirectory, limit);
