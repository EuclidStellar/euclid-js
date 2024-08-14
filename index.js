#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';

const welcomeMessage = () => {
  console.log(chalk.cyan.bold(`
  ==================================================
  =                                                =
  =                  EUCLID-JS                     =
  =           Made for Lazy People Like me         =
  =                                                =
  ==================================================
  `));
  console.log(chalk.green('Developed by: Gaurav Singh | @euclidstellar'));
  console.log(chalk.green('GitHub: https://github.com/euclidstellar'));
  console.log(chalk.green('npmjs:  http://npmjs.com/package/euclidstellar'));
  console.log();
};

const promptUser = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the project name:',
      validate: (input) => input ? true : 'Project name cannot be empty',
    },
    {
      type: 'confirm',
      name: 'generateAuth',
      message: 'Do you want to generate the auth part?',
      default: false,
    },
  ]);
  return answers;
};

const createFolders = (projectPath, generateAuth) => {
  const folders = [
    'src',
    'src/controllers',
    'src/models',
    'src/routes',
    'src/services',
    'src/utils',
    'tests'
  ];

  folders.forEach(folder => {
    const folderPath = path.join(projectPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(chalk.yellow(`Folder created: ${folderPath}`));
    }
  });
};

const createFiles = (projectPath, generateAuth) => {
  const files = {
    'README.md': '# Project Title\n\nA brief description of what this project does and who it\'s for',
    '.env': `JWT_SECRET="" 
JWT_EXPIRES_IN=""
MONGODB_URL="mongodb://localhost:27017/yourDatabaseName"
`,
    '.env.example': `# JWT Secret Key
# Replace 'yourSecretKey' with a strong, random secret key
JWT_SECRET=yourSecretKey

# JWT Token Expiration
# Set the duration for which the JWT token is valid
# Examples: '1h' for 1 hour, '7d' for 7 days, '30m' for 30 minutes
JWT_EXPIRES_IN=1h

# Local MongoDB URL
MONGODB_URL="mongodb://localhost:27017/yourDatabaseName"
`,
    'package.json': `{
  "name": "PROJECT_NAME_PLACEHOLDER",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "bin": {
    "euclid-cli": "./index.mjs"
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
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});

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

module.exports = router;`,
  };

  if (generateAuth) {
    files['src/utils/jwt.js'] = `const jwt = require("jsonwebtoken");
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
`;
    files['src/models/model.js'] = `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Method to check if password is correct
userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
`;
  }

  Object.keys(files).forEach(filePath => {
    const absolutePath = path.join(projectPath, filePath);
    const content = files[filePath].replace('PROJECT_NAME_PLACEHOLDER', path.basename(projectPath));
    fs.outputFileSync(absolutePath, content);
    console.log(chalk.yellow(`File created: ${absolutePath}`));
  });
};

const main = async () => {
  welcomeMessage();
  
  const { projectName, generateAuth } = await promptUser();
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(chalk.red(`Folder ${projectName} already exists. Choose a different project name.`));
    process.exit(1);
  }

  fs.mkdirSync(projectPath);
  console.log(chalk.green(`Project folder created: ${projectPath}`));

  createFolders(projectPath, generateAuth);
  createFiles(projectPath, generateAuth);

  // Install dependencies
  console.log(chalk.blue('Installing dependencies...'));
  exec(`cd ${projectPath} && npm install`, (err, stdout, stderr) => {
    if (err) {
      console.error(chalk.red(`Error installing dependencies: ${err.message}`));
      return;
    }
    console.log(stdout);
    console.error(stderr);

const displayFinalMessage = () => {
  console.log(chalk.cyan.bold(`
  =====================================================
  =                                                   =
  =   "You are the distance between the last          =
  =    metaphor of the verse and the full stop..."    =
  =                ~ Gaurav Singh                     =
  =                                                   =
  =====================================================
  `));
};
    displayFinalMessage();
    console.log(chalk.green('Dependencies installed successfully , Happy Coding!'));
  });
};

main();




