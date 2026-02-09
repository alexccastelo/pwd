FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies including devDependencies for building
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/index.js"]
