FROM node:latest

ADD src /opt/sword/api/src
ADD package.json /opt/sword/api/package.json
ADD tsconfig.json /opt/sword/api/tsconfig.json
ADD jest.config.js /opt/sword/api/jest.config.js
WORKDIR /opt/sword/api

RUN npm install
RUN node_modules/.bin/tsc