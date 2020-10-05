<h1 align="center">JobTrackifyAPI</h1>

<p align="center">
  <a href="https://stackshare.io/bymi15/jobtrackifyapi">
    <img src="http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat" alt="stackshare" />
  </a>
</p>

<br />

## Getting Started

### Step 1: Set up the Development Environment

Install [Node.js and NPM](https://nodejs.org/en/download/)

Install a [MongoDB server](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Step 2: Create a new project

Fork or download this project and modify `package.json` for your new project.

Make a copy of the `.env.example` file and rename it to `.env`.

Create a new database and add the connection string in the `.env` file.

Install the required packages.

```bash
npm install
```

> This installs all the dependencies with NPM.

Now your development environment should be ready to use!

### Step 3: Serve your application

Go to the root directory and start your app with this npm script.

```bash
npm run dev
```

> This starts a local server using `nodemon` and `ts-node`.
> The server base endpoint will be `http://127.0.0.1:3000` where `3000` is the PORT variable you set in the `.env` file.

## Scripts and Tasks

### Install

- Install all dependencies with `npm install`

### Linting

- Run code syntax and format checking using `npm run lint` which runs eslint.
- Automatically fix lint errors with `npm run lint:fix`.

### Running MongoDB locally

- Run `npm run mongodb` to start a local MongoDB server with it's data stored in `.mongodb` in the root directory.
- This is very useful for unit / integration testing.
- It's always a good idea to use a separate database for testing.

### Tests

- Run unit tests using `npm run test` (for Windows users) or `npm run test:unix` (for Mac and Linux users).

### Running the app in development

- Run `npm run dev` to start nodemon with ts-node.
- The server base endpoint will be `http://127.0.0.1:8000` where `8000` is the PORT variable you set in the `.env` file.

### Building and running the app in production

- Run `npm run build` to compile all the Typescript sources and generate JavaScript files.
- To start the built app located in `build` use `npm start`.

## API Routes

| Route                  | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| **/api**               | Base endpoint                                            |
| **/api/auth/login**    | Auth - login endpoint                                    |
| **/api/auth/register** | Auth - register endpoint                                 |
| **/api/user**          | Example entity endpoint - returns current logged in user |

## Project Structure

| Name                       | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| **.mongodb/**              | Local MongoDB server data                             |
| **build/**                 | Compiled source files will be placed here             |
| **commands/**              | Custom CLI command tools used with npm scripts        |
| **src/**                   | Source files                                          |
| **src/api/middlewares/**   | Custom middlewares                                    |
| **src/api/entities/**      | TypeORM Entities (Database model abstractions)        |
| **src/api/services/**      | Service layer                                         |
| **src/config/**            | The configuration file which loads env variables      |
| **src/database/factories** | Factories generate entities with mock data            |
| **src/database/seeds**     | Seeds use factories to save mock data in the database |
| **src/loaders/**           | Loaders set up the app, database and dependencies     |
| **src/types/** \*.d.ts     | Custom type definitions                               |
| **tests** \*.spec.ts       | Unit and integration tests                            |
| .env.example               | Environment configurations                            |

## License

[apache-2.0](/LICENSE)
