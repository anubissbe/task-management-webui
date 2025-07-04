FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js security-utils.js ./
EXPOSE 3010
CMD ["node", "server.js"]