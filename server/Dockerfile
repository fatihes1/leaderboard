FROM node:20-alpine

LABEL authors="fatichdev"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

RUN npx prisma generate

CMD ["npm", "run", "dev"]