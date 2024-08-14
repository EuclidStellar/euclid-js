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
  'tests'
];

// Template files content
const files = {
  'src/utils/jwt.js':`const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRES_IN;

const generateToken = (user) => {
  try {
    return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
  } catch (error) {
    console.error("Error while generating JWT token:", error.message);
    return null;
  }
};

const verifyToken = (req, res, next) => {
  // Extract token from Authorization header
  const token = req?.headers?.authorization?.split(' ')[1]; // Extract token after "Bearer "

  if (!token) {
    return res.status(401).json({ message: "Authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = {
      id: decoded.data.id,
      username: decoded.data.username
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error while decoding JWT token:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = { generateToken, verifyToken };
`,
  'README.md': '# Project Title\n\nA brief description of what this project does and who it\'s for',
  '.env':'JWT_SECRET="" \nJWT_EXPIRES_IN=""',
  '.env.example':`# JWT Secret Key
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
    "test": "echo \\"Error: no test specified\\" && exit 1"
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
const env = require('dotenv')
env.config()
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

// Define your routes here
router.get('/', (req, res) => {
  res.send('Welcome to the API');
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
