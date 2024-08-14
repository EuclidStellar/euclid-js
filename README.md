Sure, here’s an updated version of the README with a section that includes a Markdown example of using the CLI:

---

# euclid-js | Node.js Backend Generator

Euclid is a CLI tool designed to streamline the creation of a Node.js backend project. It generates a well-structured project folder with best practices, installs necessary dependencies, and provides template code to help you start quickly.

## Features

- **Generates a Standard Node.js Project Structure**: Quickly set up a consistent project layout.
- **Installs Common Dependencies**: Automatically installs essential libraries and tools for backend development.
- **Provides Template Code**: Includes base code for `index.js` and routes to jump-start your application.
- **CLI Interaction**: Beautiful command-line interface for a smooth user experience.
- **Optional Authentication Setup**: Choose to include authentication-related files and setup.

## Installation

To install the Euclid Generator globally, use npm:

```bash
npm install -g euclidstellar
```

## Usage

After installing the package globally, you can generate a new project by running the following command:

```bash
euclid <project-name>
```

Replace `<project-name>` with your desired project name. This command will create a folder with the specified project name and set up the project structure and dependencies.

### CLI Interaction

When you run the CLI, you will interact with the following prompts:

1. **Welcome Message**: Displays a welcome message with developer information and project details.
2. **Project Name Prompt**: Asks for the name of the project.
3. **Generate Auth Part**: Prompts whether to include authentication-related code.
   - **Y**: Includes authentication setup and additional files.
   - **N**: Only generates the basic project structure and core files.

### Example CLI Interaction

Here's an example of how the CLI might look when you run it:

```bash
$ euclid my-awesome-project

  ==================================================
  =                                                =
  =                  EUCLID-JS                     =
  =           A Project Generator CLI              =
  =                                                =
  ==================================================

Developed by: Gaurav Singh | @euclidstellar
GitHub: https://github.com/euclidstellar
npmjs:  http://npmjs.com/package/euclidstellar

Enter the project name: my-awesome-project

Do you want to generate the auth part? (y/N): y

Project folder created: /path/to/my-awesome-project
Folder created: /path/to/my-awesome-project/src
Folder created: /path/to/my-awesome-project/src/controllers
Folder created: /path/to/my-awesome-project/src/models
Folder created: /path/to/my-awesome-project/src/routes
Folder created: /path/to/my-awesome-project/src/services
Folder created: /path/to/my-awesome-project/src/utils
Folder created: /path/to/my-awesome-project/tests
File created: /path/to/my-awesome-project/README.md
File created: /path/to/my-awesome-project/.env
File created: /path/to/my-awesome-project/.env.example
File created: /path/to/my-awesome-project/package.json
File created: /path/to/my-awesome-project/index.js
File created: /path/to/my-awesome-project/src/routes/index.js
File created: /path/to/my-awesome-project/src/utils/jwt.js
File created: /path/to/my-awesome-project/src/models/model.js

Installing dependencies...
+ express@4.17.1
+ mongoose@5.10.9
+ dotenv@8.2.0
+ jsonwebtoken@8.5.1
+ bcryptjs@2.4.3
+ cors@2.8.5
+ body-parser@1.19.0
+ nodemon@2.0.4
+ winston@3.3.3
+ passport@0.4.1
+ multer@1.4.2
+ sequelize@6.3.5
+ helmet@4.1.1

Dependencies installed successfully.

You are the distance between the last metaphor of the verse and the full stop ~ Gaurav
```

## Project Structure

The generated project will have the following structure:

```
<project-name>/
├── README.md
├── package.json
├── index.js
├── src
│   ├── controllers
│   ├── models
│   ├── routes
│   │   └── index.js
│   ├── utils
│   │   └── jwt.js
│   └── services 
└── tests
```

- `index.js`: Entry point of your application.
- `src/controllers`: Folder for your controllers.
- `src/models`: Folder for your models.
- `src/routes`: Folder for your routes.
- `src/services`: Folder for your services.
- `tests`: Folder for your tests.
- `jwt.js`: Script for handling generation and verification of JSON Web Tokens (included if authentication setup is selected).

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

This project is licensed under the MIT License.

---

Feel free to adjust the content or formatting as needed! Let me know if you have any other requests or questions. 😊