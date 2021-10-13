# Toptal Project

## Overview

This project creates an API server that allows users to signup, login, and perform CRUD operations for different timezones. A user will be able to get the current time of all timezones created. In addition, a user can be upgraded to an admin role. An admin will be able to perform CRUD operations on both users and user timezones.

## Prerequistes
- Node v16
- yarn

## Getting started

1. Install the dependencies
	``` bash
		yarn
	```
2. Configure ENV values
   1. Create a file called `.env` in `src/config` (Use `.env.example` as a template)
   2. Add your values to the required ENV variables
	``` bash
		NODE_ENV= // Node ENV to run server on. Defaults to development
		PORT= // Port to run server on. Defaults to 8080
		SALT_ROUNDS= // Salt rounds for bcrypt hashing. Defaults to 10
		JWT_SECRET= // Secret key to create JWT tokens. Defaults to shhh
		MASTER_ADMIN_ID= // Master user account ID. Defaults to 1
		MASTER_ADMIN_EMAIL= // Master user account email. No default
		MASTER_ADMIN_PASSWORD= // Master user password. Defaults to password123
	```
3. Run DB migrations and seeders
	``` bash
		node_modules/.bin/sequelize db:migrate && node_modules/.bin/sequelize db:seed:all
	```
4. Run the server
	``` bash
		yarn start
	```

## Libraries Used
- bcrypt v5.0.1
- bluebird v3.7.2
- city-timezones v1.2.0
- dotenv v10.0.0
- express v4.17.1
- joi v17.4.2
- jsonwebtoken v8.5.1
- lodash v4.17.21
- luxon v2.0.2
- nanoid v3.1.29
- sequelize v6.6.5
- sqlite3 v5.0.2
- validator v13.6.0
- winston v3.3.3
- winston-daily-rotate-file v4.5.5

## Endpoints
