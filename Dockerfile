# Use an official Node.js image as the base
FROM node:22-alpine

# Switch to root (default for alpine images)
USER root

# Install curl if not already available (alpine uses apk)
RUN apk add --no-cache curl

# Install Ollama using the install script (this runs with superuser privileges)
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock first to leverage Docker cache
COPY package.json yarn.lock ./

# Install node dependencies (or use npm install if you prefer)
RUN yarn install

# Copy your application code
COPY . .

# Expose the port that your Express app listens on (adjust if needed)
EXPOSE 11434

# Command to run your Node.js application
CMD ["node", "index.js"]
