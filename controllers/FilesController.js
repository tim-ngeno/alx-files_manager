import { uuid } from 'uuidv4';
import fs from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FilesController = {
  async postUpload(req, res) {
    // Get mongodb instance
    const mongoClient = dbClient.getMongoClient();
    const filesCollection = mongoClient.db().collection('files');

    // retrieve token
    const token = req.headers['X-Token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse the request body
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    // Validate input parameters
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400)
        .json({ error: 'Missing type or invalid type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // If parentId is set, check if parent exists and is a folder
    if (parentId !== 0) {
      const parentFile = filesCollection.findOne({ _id: parentId });
      if (!parentFile || parentFile.type !== 'folder') {
        return res.status(400)
          .json({ error: 'Parent not found or is not a folder' });
      }
    }

    // Create a new file document
    const newFile = {
      userId,
      name,
      type,
      parentId,
      isPublic,
    };

    // If file is folder, add the new file to  collection and return
    if (type === 'folder') {
      const insertedFile = await filesCollection.insertOne(newFile);
      return res.status(201).json(insertedFile.ops[0]);
    }

    // Store file locally
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const localPath = `${folderPath}/${uuid()}`;
    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

    // Add file document to the collection
    const fileWithLocalPath = {
      ...newFile,
      localPath,
    };
    const insertedFile = await filesCollection.insertOne(fileWithLocalPath);

    return res.status(201).json(insertedFile.ops[0]);
  },

  // Retrieve file documents based on ID
  async getShow(req, res) {
    const token = req.headers['X-Token'];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const mongoClient = dbClient.getMongoClient();
    const usersCollection = mongoClient.db().collection('users');
    const user = usersCollection.findOne({ _id: userId });

    if (!user.file) {
      res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json({ user });
  },
};

module.exports = FilesController;
