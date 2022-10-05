FROM node:16.10.0

WORKDIR /usr/src/app

COPY .env package.json yarn.lock ./
RUN yarn install --prod

COPY prisma/schema.prisma ./prisma/
RUN yarn prisma generate

COPY . .

CMD [ "yarn", "start" ]
