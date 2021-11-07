FROM node:16.13-buster-slim

WORKDIR /usr/src/app

COPY . .

RUN npm ci --only=production

EXPOSE 3000

CMD [ "node", "bin/www" ]
