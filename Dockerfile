FROM node:24-slim

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

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
