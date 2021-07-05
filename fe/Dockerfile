FROM node:latest

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY sword-web-fe/package.json /app/package.json
COPY sword-web-fe/public /app/public
COPY sword-web-fe/src /app/src
COPY sword-web-fe/tsconfig.json /app/tsconfig.json
COPY sword-web-fe/yarn.lock /app/yarn.lock

RUN npm install --silent
RUN npm install react-scripts@4.0.3 -g --silent
