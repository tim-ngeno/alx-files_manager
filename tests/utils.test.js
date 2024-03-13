import { expect } from 'mocha';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

describe('redis client', () => {
  it('should set and get values from Redis', async () => {
    expect.assertions(1);

    const key = 'testKey';
    const value = 'testValue';

    // Set a value in Redis
    await redisClient.set(key, value);

    // Get the value from Redis
    const retrievedValue = await redisClient.get(key);

    expect(retrievedValue).toStrictEqual(value);
  });
});

describe('mongoDB client', () => {
  it('should connect to MongoDB and execute queries', async () => {
    expect.assertions(2);
    // Test connecting to MongoDB
    const mongoClient = await dbClient.getMongoClient();
    expect(mongoClient.isConnected()).toBe(true);

    // Test executing a query
    const db = mongoClient.db();
    const usersCollection = db.collection('users');
    const count = await usersCollection.countDocuments();
    expect(count).toBeGreaterThan(-1);
  });
});
