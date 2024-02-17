FROM node:18

WORKDIR /usr/afripay-express-BE/user

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

## run migrations before starting application
RUN [ "npm", "run", "start:prod" ]

CMD [ "npm", "run", "start:prod" ]