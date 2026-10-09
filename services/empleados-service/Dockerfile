# Imagen independiente por microservicio: cada uno se construye y despliega por separado.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY src ./src
USER node
CMD ["node", "src/main.js"]
