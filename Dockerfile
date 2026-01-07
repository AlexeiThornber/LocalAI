# 1. Use Node.js as the base image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# 4. Copy the rest of your project
COPY . .

# 5. Build TypeScript
RUN npx tsc

# 6. Install a static server (http-server is simple)
RUN npm install -g http-server

# 7. Expose the port (default 8080 for http-server)
EXPOSE 8080

# 8. Start the server, serving the root directory
CMD ["http-server", ".", "-p", "8080"]
