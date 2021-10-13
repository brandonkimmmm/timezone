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

- ### Public endpoints
  - `GET /info`
    - Returns application version and name
    - Response Example
		```json
		{
			"name": "Brandon-Kim",
			"version": "1.0.0"
		}
		```
  - `POST /signup`
    - Signs up a new user and returns created user
    - Body Request
      - `email`: new user email
      - `password`: new user password. Must be alphanumerica with 8-20 characters
      - `password_confirmation`: Same value as `password`
    - Response Example
		```json
		{
			"role": "user",
			"id": 4,
			"email": "bkim2421@gmail.com",
			"updated_at": "2021-10-13T13:06:08.429Z",
			"created_at": "2021-10-13T13:06:08.429Z"
		}
		```
  - `POST /login`
    - Logs in a user and returns a JWT token
    - Body Request
      - `email`: user email
      - `password`: user password
    - Response Example
		```json
		{
			"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJia2ltMjQ5MEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MzQxMzAzNzksImV4cCI6MTYzNDIxNjc3OX0.q8rluiVr1wrd38AE9e1qio5eYTpIanrMZTn7sBzw0NM"
		}
		```
- ### User endpoints (**Endpoints require a Bearer token in the header**)
  - `GET /user`
    - Returns requesting user's info
    - Response Example
		```json
		{
			"id": 1,
			"email": "bkim2490@gmail.com",
			"role": "admin",
			"created_at": "2021-10-13 11:49:07",
			"updated_at": "2021-10-13 11:49:07"
		}
		```
  - `GET /user/timezones`
    - Returns a user's created timezones and current times
    - Response Example
		```json
		[
			{
				"name": "chile home",
				"city": "los angeles",
				"timezone": "America/Santiago",
				"offset": "-3:00",
				"current_time": "October 13, 2021, 10:04:04 AM GMT-3"
			},
			{
				"name": "seoul home",
				"city": "seoul",
				"timezone": "Asia/Seoul",
				"offset": "9:00",
				"current_time": "October 13, 2021, 10:04:04 PM GMT+9"
			}
		]
		```
  - `POST /user/timezone`
    - Creates a new timezone and returns created timezone
    - Body Request
      - `name`: Custom name of timezone
      - `city`: Timezone city
      - `country`(optional): Timezone country in 2 character country code
    - Response Example
		```json
		{
			"id": 5,
			"user_id": 1,
			"name": "seoul home",
			"city": "seoul",
			"timezone": "Asia/Seoul",
			"offset": "9:00",
			"updated_at": "2021-10-13T13:03:55.907Z",
			"created_at": "2021-10-13T13:03:55.907Z"
		}
		```
  - `PUT /user/timezone`
    - Updates a user timezone name and/or city and returns updated timezone
    - Body Request
      - `name`: Name of timezone to update
      - `updated_name`: New name of timezone
      - `updated_city`: Updated city of timezone
      - `country`(optional): Updated city's country
    - Response Example
		```json
		{
			"id": 6,
			"name": "tokyo home",
			"city": "tokyo",
			"timezone": "Asia/Tokyo",
			"offset": "9:00",
			"created_at": "2021-10-13T13:03:55.907Z",
			"updated_at": "2021-10-13T13:05:10.331Z",
			"user_id": 1
		}
		```
  - `DELETE /user/timezone`
    - Deletes a user's timezone and returns deleted timezone
    - Body Request
      - `name`: Name of timezone to delete
    - Response Example
		```json
		{
			"id": 6,
			"name": "tokyo home",
			"city": "tokyo",
			"timezone": "Asia/Tokyo",
			"offset": "9:00",
			"created_at": "2021-10-13T13:03:55.907Z",
			"updated_at": "2021-10-13T13:05:10.331Z",
			"user_id": 1
		}
		```
- ### Admin endpoints (**Endpoints require a Bearer token in the header from admin**)
  - `GET /admin/user`
    - Returns a user's info
    - Query Param
      - `user_id`: ID of user to get
    - Response Example
		```json
		{
			"id": 4,
			"email": "bkim2421@gmail.com",
			"role": "user",
			"created_at": "2021-10-13 13:06:08.429 +00:00",
			"updated_at": "2021-10-13 13:06:08.429 +00:00"
		}
		```
  - `GET /admin/users`
    - Returns all users in application
    - Query Param
      - `role`(optional): Get users with specific roles
    - Response Example
		```json
		[
			{
				"id": 1,
				"email": "bkim2490@gmail.com",
				"role": "admin",
				"created_at": "2021-10-13 11:49:07",
				"updated_at": "2021-10-13 11:49:07"
			},
			{
				"id": 4,
				"email": "bkim2421@gmail.com",
				"role": "user",
				"created_at": "2021-10-13 13:06:08.429 +00:00",
				"updated_at": "2021-10-13 13:06:08.429 +00:00"
			}
		]
		```
  - `POST /admin/user`
    - Creates a new user and returns created user
    - Body Request
      - `email`: new user email
      - `password`: new user password. Must be alphanumerica with 8-20 characters
      - `password_confirmation`: Same value as `password`
    - Response Example
		```json
		{
			"role": "user",
			"id": 5,
			"email": "bkim242@gmail.com",
			"updated_at": "2021-10-13T13:07:57.273Z",
			"created_at": "2021-10-13T13:07:57.273Z"
		}
		```
  - `DELETE /admin/user`
    - Deletes a user and returns deleted user
    - Body Request
      - `user_id`: ID of user to delete
    - Response Example
		```json
		{
			"id": 5,
			"email": "bkim242@gmail.com",
			"role": "user",
			"created_at": "2021-10-13T13:07:57.273Z",
			"updated_at": "2021-10-13T13:07:57.273Z"
		}
		```
  - `PUT /admin/user/role`
    - Updates a user's role and returns updated user
    - Body Request
      - `user_id`: ID of user to update
      - `role`: New role to update to. Enum: [`admin`, `user`]
    - Response Example
		```json
		{
			"id": 4,
			"email": "bkim2421@gmail.com",
			"role": "admin",
			"created_at": "2021-10-13T13:06:08.429Z",
			"updated_at": "2021-10-13T13:08:30.090Z"
		}
		```
  - `GET /admin/user/timezones`
    - Returns a user's timezones and current times
    - Query param
      - `user_id`: ID of user to get timezones of
    - Response Example
		```json
		[
			{
				"name": "chile home",
				"city": "los angeles",
				"timezone": "America/Santiago",
				"offset": "-3:00",
				"current_time": "October 13, 2021, 10:04:04 AM GMT-3"
			},
			{
				"name": "seoul home",
				"city": "seoul",
				"timezone": "Asia/Seoul",
				"offset": "9:00",
				"current_time": "October 13, 2021, 10:04:04 PM GMT+9"
			}
		]
		```
  - `POST /admin/user/timezone`
    - Creates a new timezone for a user and returns created timezone
    - Body Request
      - `user_id`: ID of user to create timezone for
      - `name`: Custom name of timezone
      - `city`: Timezone city
      - `country`(optional): Timezone country in 2 character country code
    - Response Example
		```json
		{
			"id": 5,
			"user_id": 2,
			"name": "seoul home",
			"city": "seoul",
			"timezone": "Asia/Seoul",
			"offset": "9:00",
			"updated_at": "2021-10-13T13:03:55.907Z",
			"created_at": "2021-10-13T13:03:55.907Z"
		}
		```
  - `PUT /admin/user/timezone`
    - Updates a user's timezone and returns updated timezone
    - Body Request
      - `user_id`: ID of user to update timezone for
      - `name`: Name of timezone to update
      - `updated_name`: New name of timezone
      - `updated_city`: Updated city of timezone
      - `country`(optional): Updated city's country
    - Response Example
		```json
		{
			"id": 5,
			"name": "tokyo home",
			"city": "tokyo",
			"timezone": "Asia/Tokyo",
			"offset": "9:00",
			"created_at": "2021-10-13T13:03:55.907Z",
			"updated_at": "2021-10-13T13:05:10.331Z",
			"user_id": 2
		}
		```
  - `DELETE /admin/user/timezone`
    - Deletes a user's timezone and returns deleted timezone
    - Body Request
      - `user_id`: ID of user to delete timezone for
      - `name`: Name of timezone to delete
    - Response Example
		```json
		{
			"id": 5,
			"name": "tokyo home",
			"city": "tokyo",
			"timezone": "Asia/Tokyo",
			"offset": "9:00",
			"created_at": "2021-10-13T13:03:55.907Z",
			"updated_at": "2021-10-13T13:05:10.331Z",
			"user_id": 2
		}
		```