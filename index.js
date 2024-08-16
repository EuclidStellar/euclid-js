#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";
import chalk from "chalk";

const welcomeMessage = () => {
  console.log(
    chalk.cyan.bold(`
  ==================================================
  =                                                =
  =                  EUCLID-JS                     =
  =           Made for Lazy People Like me         =
  =                                                =
  ==================================================
  `)
  );
  console.log(chalk.green("Developed by: Gaurav Singh | @euclidstellar"));
  console.log(chalk.green("GitHub: https://github.com/euclidstellar"));
  console.log(chalk.green("npmjs:  http://npmjs.com/package/euclidstellar"));
  console.log();
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const promptUser = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter the project name:",
      validate: (input) => (input ? true : "Project name cannot be empty"),
    },
    {
      type: "input",
      name: "port",
      message: "Enter the port number:",
      default: 3000,
      validate: (input) =>
        !isNaN(input) && input > 0
          ? true
          : "Port number must be a positive number",
    },
    {
      type: "confirm",
      name: "generateAuth",
      message: "Do you want to generate the JWT authorization?",
      default: false,
    },
    {
      type: "input",
      name: "jwtSecret",
      message: "Enter JWT Secret:",
      when: (answers) => answers.generateAuth,
      validate: (input) => (input ? true : "JWT Secret cannot be empty"),
    },
    {
      type: "input",
      name: "jwtExpiresIn",
      message: "Enter JWT Expiry Time (e.g., 1h):",
      when: (answers) => answers.generateAuth,
      validate: (input) => (input ? true : "JWT Expiry Time cannot be empty"),
    },
    {
      type: "input",
      name: "mongodbName",
      message: "Enter the MongoDB database name:",
      validate: (input) => (input ? true : "Database name cannot be empty"),
    },
    {
      type: "confirm",
      name: "initGit",
      message:
        "Do you want to initialize a Git repository and commit the initial files?",
      default: false,
    },
    {
      type: "input",
      name: "gitUsername",
      message: "Enter your GitHub username:",
      when: (answers) => answers.initGit,
      validate: (input) => (input ? true : "GitHub username cannot be empty"),
    },
    {
      type: "input",
      name: "gitRepoName",
      message: "Enter the GitHub repository name:",
      when: (answers) => answers.initGit,
      validate: (input) => (input ? true : "Repository name cannot be empty"),
    },
  ]);

  return answers;
};

const createFolders = async (projectPath) => {
  const folders = [
    "src",
    "src/controllers",
    "src/models",
    "src/routes",
    "src/services",
    "src/utils",
    "tests",
  ];

  folders.forEach((folder) => {
    const folderPath = path.join(projectPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(chalk.yellow(`Folder created: ${folderPath}`));
    }
  });
};

const createFiles = async (projectPath, answers) => {
  const mongodbUrl = `mongodb://localhost:27017/${answers.mongodbName}`;
  let envContent = `PORT=${answers.port}\nMONGODB_URL="${mongodbUrl}"`;

  if (answers.generateAuth) {
    envContent += `\nJWT_SECRET="${answers.jwtSecret}"\nJWT_EXPIRES_IN="${answers.jwtExpiresIn}"`;
  }

  const files = {
    ".gitignore": ".env\nnode_modules",
    "README.md":
      "# Project Title\n\nA brief description of what this project does and who it's for",
    ".env": envContent,
    ".env.example": `# JWT Secret Key
# Replace 'yourSecretKey' with a strong, random secret key
JWT_SECRET=yourSecretKey

# JWT Token Expiration
# Set the duration for which the JWT token is valid
# Examples: '1h' for 1 hour, '7d' for 7 days, '30m' for 30 minutes
JWT_EXPIRES_IN=1h

# Local MongoDB URL
MONGODB_URL="mongodb://localhost:27017/yourDatabaseName"
`,
    "package.json": `{
  "name": "${answers.projectName}",
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
    "index.js": `const express = require('express');
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
    "src/routes/index.js": `const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
  res.send('Welcome to the API');
});

module.exports = router;`,
  };

  if (answers.generateAuth) {
    files["src/utils/jwt.js"] = `const jwt = require("jsonwebtoken");
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
    files["src/models/model.js"] = `const mongoose = require('mongoose');
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

// Encrypt password before saving the user
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
`;
    files["src/routes/authRoutes.js"] = `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/model');
const { generateToken, verifyToken } = require('../utils/jwt');

// User registration route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// User login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
`;

    files["src/routes/index.js"] = `const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

router.use('/auth', authRoutes);

module.exports = router;
`;
  }

  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(projectPath, fileName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(chalk.yellow(`File created: ${filePath}`));
    }
  }
};

const initGitRepository = (projectPath) => {
  execSync("git init", { stdio: "inherit", cwd: projectPath });
  execSync("git add .", { stdio: "inherit", cwd: projectPath });
  execSync('git commit -m "Initial commit"', { stdio: "inherit", cwd: projectPath });
};

const installNodeModules = (projectPath) => {
  console.log(chalk.blue("Installing node modules..."));
  execSync("npm install", { stdio: "inherit", cwd: projectPath });
  console.log(chalk.green("Node modules installed."));
};

const run = async () => {
  welcomeMessage();
  const answers = await promptUser();
  const projectPath = path.join(process.cwd(), answers.projectName);

  if (fs.existsSync(projectPath)) {
    console.error(chalk.red("Error: Project folder already exists"));
    process.exit(1);
  }

  fs.mkdirSync(projectPath, { recursive: true });
  await createFolders(projectPath);
  await createFiles(projectPath, answers);

  if (answers.initGit) {
    initGitRepository(projectPath);
  }

  installNodeModules(projectPath);

 
  const displayFinalMessage = async => {
    console.log(
        chalk.cyan.bold(`
    ==================================================
    =                                                =
    = Developed by: Gaurav Singh | @euclidstellar    =
    =        Project setup complete 🚀               =
    =                                                =
    ==================================================
    `)
    );
   
  }

  displayFinalMessage();
};

run().catch((error) => {
  console.error(chalk.red("Error occurred during project setup:", error.message));
  process.exit(1);
});
