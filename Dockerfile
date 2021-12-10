FROM node:17.2.0-alpine3.12
RUN apk add --no-cache bash
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn

COPY . /app
RUN yarn build

EXPOSE 8080
CMD [ "yarn", "start" ]