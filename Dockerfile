FROM node:alpine

WORKDIR /app

COPY . .

EXPOSE 7860

RUN apk update && apk upgrade &&\
    apk add --no-cache openssl curl gcompat iproute2 coreutils &&\
    chmod +x index.js server swith web tunnel.yml tunnel.json &&\
    npm install

CMD ["node", "index.js"]