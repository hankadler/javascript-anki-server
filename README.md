# Anki Server

An express app for learning with flashcards

## Setup

### Node

This code uses ES6+ ``import/export`` syntax. To prevent errors do the following:

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
   - ``HOST`` - prod app url
   - ``PORT`` - port number
   - ``DB_DEV`` - dev mongoDB url
   - ``DB_TEST`` - test mongoDB url
   - ``DB_PROD`` - prod mongoDB url
   - ``JWT_SECRET`` - jsonwebtoken secret key
   - ``JWT_EXPIRES_IN`` - jsonwebtoken expiration, e.g., 1h
   - ``COOKIE_MAX_AGE`` - jsonwebtoken cookie expiration in seconds
   - ``EMAIL_USER`` - address from which to send app emails
   - ``EMAIL_PASS`` - email account password
   - ``EMAIL_HOST`` - e.g. smtp.gmail.com
   - ``EMAIL_PORT`` - e.g. 465
   - ``EMAIL_CLIENT_ID`` - email api client id
   - ``EMAIL_CLIENT_SECRET`` - email api client id
   - ``EMAIL_REFRESH_TOKEN`` - email api refresh token

## Usage

```sh
npm i  # install dependencies
npm start  # run app for dev
```
