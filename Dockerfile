FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app code
COPY . .

# Build production bundle
RUN npm run build

# Expose port
EXPOSE 4200

# Start production server
CMD ["npm", "start"]
