FROM node:18.13-alpine

RUN npm i -g pnpm

WORKDIR /app

COPY ./package.json ./pnpm-lock.yaml ./.npmrc ./

RUN pnpm i --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm prune --prod

CMD ["pnpm", "start"]