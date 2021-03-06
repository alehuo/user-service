FROM node:12.17.0-alpine

WORKDIR /app

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python git \
  chromium chromium-chromedriver

COPY package*.json /app/
RUN npm install --development

COPY knexfile.ts .prettierrc .eslintrc.js .eslintignore ./
COPY ./src /app/src
COPY ./test /app/test
COPY ./views /app/views
COPY ./scss /app/scss
COPY ./public /app/public
COPY ./locales /app/locales
COPY ./seeds /app/seeds
COPY ./migrations /app/migrations

COPY tsconfig.json ./
RUN npm run build && \
    npm prune --production

EXPOSE 3001
CMD ["npm", "start"]
