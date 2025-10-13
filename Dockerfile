# Official NodeJS runtime as based on the image
FROM node:18-alpine

# Working directory inside the container
WORKDIR /app

# Copy package JSON and JSON lock if available
COPY package*.json ./

# Also install dependencies
RUN npm ci

# Copy source code and build
COPY . .

# Build the TS app
RUN npm run build

# Expose Port and start command
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]