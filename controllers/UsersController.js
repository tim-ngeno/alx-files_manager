import sha1 from 'sha1';
import dbClient from '../utils/db';

const postNew = async (req, res) => {
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
};

export default {
  postNew,
};
