FROM node:14.16.0-alpine

WORKDIR /app
COPY ./package.json ./package.json
COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json

RUN npm install
RUN npm run build

CMD ["npm", "start"]
