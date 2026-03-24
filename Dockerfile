FROM node:24-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files AND prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies (postinstall will run prisma generate)
RUN npm ci

# Copy rest of the app
COPY . .

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
