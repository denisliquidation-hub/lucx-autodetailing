FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Robust install for a single-dependency static server (avoids npm ci lockfile-strictness)
RUN npm install --omit=dev --no-audit --no-fund
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["node", "index.js"]
