FROM node:lts-slim as source

WORKDIR /usr/src/slowloris

COPY . .

RUN npm install

ENTRYPOINT ["node", "./src/index.js"]
