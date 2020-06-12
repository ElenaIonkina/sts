FROM node:8.15.0-alpine

RUN apk update
RUN apk upgrade
RUN apk add --update ca-certificates git make python g++ build-base ffmpeg

WORKDIR /app

COPY . .
RUN npm i

RUN ./node_modules/apidoc/bin/apidoc -i ./socket/routes -o ./doc

EXPOSE 3000

ENTRYPOINT ["npm", "start"]

