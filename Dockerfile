FROM node:14-alpine

WORKDIR /home/node

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run lint && npm run tsc && npm run build

USER node

ENTRYPOINT [ "npm" ]

CMD [ "start" ]