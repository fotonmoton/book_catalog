FROM node:14-alpine

WORKDIR /home/node

COPY package.json package-lock.json ./

RUN npm install

COPY . .

USER node

ENTRYPOINT [ "npm" ]

CMD [ "start" ]