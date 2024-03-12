import { uuid } from 'uuidv4';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const AuthController = {
  async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get credentials from authHeader
    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(
      encodedCredentials, 'base64',
    ).toString();
    const [email, password] = decodedCredentials.split(':');

    // Get mongodb instance
    const mongoClient = await dbClient.getMongoClient();
    const usersCollection = mongoClient.db().collection('users');

    const user = await usersCollection
      .findOne({ email, password: sha1(password) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuid();
    const redisKey = `auth_${token}`;
    await redisClient.set(redisKey, user._id, 24 * 60 * 60);

    return res.status(200).json({ token });
  },

  async getDisconnect(req, res) {
    const token = req.headers['X-Token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(redisKey);
    return res.status(204).send();
  },
};

module.exports = AuthController;
