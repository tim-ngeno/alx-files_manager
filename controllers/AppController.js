import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AppController = {
  async getStatus(req, res) {
    const redisIsAlive = await redisClient.isAlive();
    const dbIsAlive = await dbClient.isAlive();

    res.status(200).json({ redis: redisIsAlive, db: dbIsAlive });
  },

  async getStats(req, res) {
    const numOfUsers = await dbClient.nbUsers();
    const numFiles = await dbClient.nbFiles();

    res.status(200).json({ users: numOfUsers, files: numFiles });
  },
};

module.exports = AppController;
