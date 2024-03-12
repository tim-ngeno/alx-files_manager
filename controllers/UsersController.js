import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const UsersController = {
  async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists in the database
    const mongoClient = dbClient.getMongoClient();
    const usersCollection = mongoClient.db().collection('users');
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPwd = sha1(password);

    // Create a new user object
    const newUser = {
      email,
      password: hashedPwd,
    };

    // Insert the new user into the database
    await usersCollection.insertOne(newUser);

    // Respond with the new user
    return res.status(201).json({
      id: newUser._id,
      email: newUser.email,
    });
  },

  async getMe(req, res) {
    const token = req.headers['X-Token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);

    const mongoClient = await dbClient.getMongoClient();
    const usersCollection = mongoClient.db().collection('users');

    const user = usersCollection.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ email: user.email, id: user._id });
  },
};

export default UsersController;
