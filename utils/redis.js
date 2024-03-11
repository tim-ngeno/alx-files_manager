import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (err) => {
      console.log('Redis client error:', err);
      this.client.quit();
    });

    // Handle client disconnect
    this.client.on('end', () => {
      console.log('Redis client disconnected');
    });
  }

  // Checks if the redis client is connected
  isAlive() {
    return this.client.connected;
  }

  // Returns the redis value stored for a key
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) reject(err);
        resolve(reply);
      });
    });
  }

  // Sets a key, value pair with an expiration in redis
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  // Deletes a value based on a key
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) reject(err);
        resolve(reply);
      });
    });
  }
}

const redisclient = new RedisClient();
module.exports = redisclient;
