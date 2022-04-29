# Anki Server

## Setup

### Node

<span style="color:red">**WARNING:**</span> This code uses ES6+ ``import/export`` syntax. To
 prevent errors do the following:

- When executing directly:

```sh
NODE_OPTIONS=--experimental-specifier-resolution=node NODE_NO_WARNINGS=1 node index.js
```

- When executing through IDE, include environment variables in run/debug configurations:

```sh
NODE_OPTIONS=--experimental-specifier-resolution=node;NODE_NO_WARNINGS=1  # run config
NODE_OPTIONS=--experimental-vm-modules;NODE_NO_WARNINGS=1  # test config
```

### Env

1. Create ```.env``` file in root directory

2. Define proper values for the following environment variables:

   - ``NODE_ENV`` - dev, test, or prod
   - ``PORT`` - port number
   - ``DB_DEV`` - dev mongoDB url
   - ``DB_TEST`` - test mongoDB url
   - ``DB_PROD`` - prod mongoDB url
   - ``JWT_SECRET`` - jsonwebtoken secret key
   - ``JWT_EXPIRES_IN`` - jsonwebtoken expiration, e.g., 1h
   - ``COOKIE_MAX_AGE`` - jsonwebtoken cookie expiration in seconds

## Usage

```sh
npm i  # install dependencies
npm start  # run app for dev
```
