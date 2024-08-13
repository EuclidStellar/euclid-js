
# euclid-js | NodeJs backend generator

Euclid is a tool to generate a Node.js project template with best practices. It creates a project folder with a predefined structure, installs necessary dependencies, and provides template code to get you started quickly.

## Features

- Generates a standard Node.js project structure.
- Installs common dependencies for backend development.
- Provides template code for `index.js` and routes.
- Creates folders for controllers, models, routes, services, and tests.

## Installation

To install the Euclid Generator globally, use npm:

```bash
npm install -g euclidstellar
```

## Usage

After installing the package globally, you can generate a new project by running the following command:

```bash
euclid my-project-name
```

Replace `my-project-name` with the desired name for your project. This command will create a folder with the specified project name and set up the project structure and dependencies.

## Project Structure

The generated project will have the following structure:

```
my-project-name/
├── README.md
├── package.json
├── index.js
├── src
│   ├── controllers
│   ├── models
│   ├── routes
│   │   └── index.js
|   ├── utils
|   |   └── jwt.js
│   └── services
|   
└── tests
```

- `index.js`: Entry point of your application.
- `src/controllers`: Folder for your controllers.
- `src/models`: Folder for your models.
- `src/routes`: Folder for your routes.
- `src/services`: Folder for your services.
- `tests`: Folder for your tests.
- `jwt.js`: Script for handling generation and verification of Json Web Tokens.

## Template Code

### `index.js`

The `index.js` file is the main entry point of your application and includes basic setup code:

```javascript
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const routes = require('./src/routes');

// Use routes
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

### `src/routes/index.js`

The `index.js` file in the routes folder includes a basic route setup:

```javascript
const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
  res.send('Welcome to the API');
});

module.exports = router;
```

## Dependencies

The generated project includes the following dependencies:

- `express`: Web framework for Node.js.
- `mongoose`: MongoDB object modeling tool.
- `dotenv`: Module to load environment variables from a `.env` file.
- `jsonwebtoken`: Implementation of JSON Web Tokens.
- `bcryptjs`: Library to hash passwords.
- `cors`: Middleware to enable CORS.
- `body-parser`: Middleware to parse incoming request bodies.
- `nodemon`: Tool to automatically restart the server on file changes.
- `winston`: Logger library.
- `passport`: Authentication middleware.
- `multer`: Middleware for handling multipart/form-data.
- `sequelize`: Promise-based Node.js ORM.
- `helmet`: Middleware to secure Express apps.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any improvements or bug fixes.

## License

This project is licensed under the ISC License.
```