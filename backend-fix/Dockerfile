FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY complete_backend.js ./
EXPOSE 3010
CMD ["node", "complete_backend.js"]