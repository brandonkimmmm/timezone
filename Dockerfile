FROM node:17.2.0-slim

WORKDIR /usr/src/app

COPY . .

RUN yarn

CMD ["yarn", "dev"]