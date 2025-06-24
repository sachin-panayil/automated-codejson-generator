FROM node:20-alpine

RUN apk add --no-cache go git

RUN go install github.com/boyter/scc/v3@latest

WORKDIR /action

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

ENV PATH="/root/go/bin:${PATH}"

ENTRYPOINT ["node", "/action/dist/index.js"]