
#FROM node:6.11.0-slim
#FROM mhart/alpine-node:8
FROM node:8
RUN yarn global add npm
RUN npm --version
MAINTAINER flowz <dm@officebrain.com>
ADD . /usr/src/app/server

WORKDIR /usr/src/app/server

RUN npm install


EXPOSE 3039 4039

CMD NODE_ENV=production npm start
