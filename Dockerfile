FROM --platform=linux/amd64 node:16-bullseye

WORKDIR /app

COPY . .

RUN npm install

CMD [ "npm", "start" ]