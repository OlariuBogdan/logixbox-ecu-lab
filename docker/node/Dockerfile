# Imaginea pentru containerul is-ia-node (frontend-ul React + Vite): Node.js 24 (LTS)
# Se construieste din folderul frontend (build.context in compose.yaml).
FROM node:24-alpine

WORKDIR /app

# Instalam dependintele din package.json (pentru o prima pornire rapida)
COPY package.json package-lock.json ./
RUN npm install

EXPOSE 5173

# La fiecare pornire: instaleaza pachetele noi (daca ati adaugat) si porneste Vite in modul dev
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]
