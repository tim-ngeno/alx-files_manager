import Bull from 'bull';
import sharp from 'sharp';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const mongoClient = await dbClient.getMongoClient();
  const filesCollection = mongoClient.db().collection('files');

  const file = await filesCollection.findOne({ _id: fileId, userId });
  if (!file) {
    throw new Error('File not found');
  }

  // Generate thumbnails
  const originalFilePath = `${process.env.FOLDER_PATH}/${file.localPath}`;

  // Generate thumbnails of different sizes
  await Promise.all([
    sharp(originalFilePath).resize(500).toFile(`${originalFilePath}_500`),
    sharp(originalFilePath).resize(250).toFile(`${originalFilePath}_250`),
    sharp(originalFilePath).resize(100).toFile(`${originalFilePath}_100`),
  ]);
});

module.exports = fileQueue;
