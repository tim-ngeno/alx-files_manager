import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    // Handle connection to mongodb
    this.client.connect((err) => {
      if (err) {
        console.error('Mongodb connection error:', err);
      } else {
        console.log('Mongodb connection success');
      }
    });
  }

  isAlive() {
    return !!this.client && this.client.isConnected();
  }

  async nbUsers() {
    if (!this.client.isConnected()) return 0;

    const db = this.client.db();
    const usersCollection = db.collection('users');
    return usersCollection.countDocuments();
  }

  async nbFiles() {
    if (!this.client.isConnected()) return 0;

    const db = this.client.db();
    const filesCollection = db.collection('files');
    return filesCollection.countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
