FROM node:18.13-alpine

RUN npm i -g pnpm pm2

WORKDIR /app

COPY ./package.json ./pnpm-lock.yaml ./

RUN pnpm i --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm prune --prod

CMD ["pm2-runtime", "-i 4", "app"]