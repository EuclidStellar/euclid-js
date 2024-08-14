#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

const projectName = process.argv[2];

if (!projectName) {
  console.error('Please provide a project name.');
  process.exit(1);
}

const projectPath = path.join(process.cwd(), projectName);

// Folder structure to be created
const folders = [
  'src',
  'src/controllers',
  'src/models',
  'src/routes',
  'src/services',
  'src/utils',
  'src/middleware',
  'tests'
];

// Template files content
const files = {
  'src/utils/jwt.js': `const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
`,
  'src/models/model.js': `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Hash the password before saving the user
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', UserSchema);
`,
  'src/middleware/authMiddleware.js': `const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user information to request object
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authorize;
`,
  '.env': `MONGO_URI="mongodb://localhost:27017/yourDatabaseName"
JWT_SECRET=""
JWT_EXPIRES_IN=""`,
  '.env.example': `# MongoDB URI
# Replace 'yourDatabaseName' with your database name
MONGO_URI=mongodb://localhost:27017/yourDatabaseName

# JWT Secret Key
# Replace 'yourSecretKey' with a strong, random secret key
JWT_SECRET=yourSecretKey

# JWT Token Expiration
# Set the duration for which the JWT token is valid
# Examples: '1h' for 1 hour, '7d' for 7 days, '30m' for 30 minutes
JWT_EXPIRES_IN=1h
`,
  'package.json': `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "mongoose": "^5.10.9",
    "dotenv": "^8.2.0",
    "jsonwebtoken": "^8.5.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "body-parser": "^1.19.0",
    "nodemon": "^2.0.4",
    "winston": "^3.3.3",
    "passport": "^0.4.1",
    "multer": "^1.4.2",
    "sequelize": "^6.3.5",
    "helmet": "^4.1.1"
  }
}`,
  'index.js': `const express = require('express');
const app = express();
const env = require('dotenv');
env.config();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const routes = require('./src/routes');

// Use routes
app.use('/api', routes);

app.listen(port, () => {
  console.log(\`Server is running on port \${port}\`);
});`,
  'src/routes/index.js': `const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authMiddleware');

// Define your routes here
router.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Protected route
router.get('/protected', authorize, (req, res) => {
  res.send(\`Hello \${req.user.username}, you have access to this protected route.\`);
});

module.exports = router;`
};

// Function to create folders
function createFolders() {
  folders.forEach(folder => {
    const folderPath = path.join(projectPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`Folder created: ${folderPath}`);
    }
  });
}

// Function to create files with template content
function createFiles() {
  Object.keys(files).forEach(filePath => {
    const absolutePath = path.join(projectPath, filePath);
    fs.outputFileSync(absolutePath, files[filePath]);
    console.log(`File created: ${absolutePath}`);
  });
}

// Main function to generate template
function generateTemplate() {
  if (fs.existsSync(projectPath)) {
    console.error(`Folder ${projectName} already exists. Choose a different project name.`);
    process.exit(1);
  }

  fs.mkdirSync(projectPath);
  console.log(`Project folder created: ${projectPath}`);

  createFolders();
  createFiles();

  // Install dependencies
  console.log('Installing dependencies...');
  exec(`cd ${projectPath} && npm install`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error installing dependencies: ${err.message}`);
      return;
    }
    console.log(stdout);
    console.error(stderr);
    console.log('Dependencies installed successfully.');
  });
}

// Execute the main function
generateTemplate();
