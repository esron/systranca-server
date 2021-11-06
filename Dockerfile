FROM node:14-alpine3.14

WORKDIR /usr/src/app

COPY . .

RUN npm ci --only=production

EXPOSE 3000

CMD [ "node", "bin/www" ]
