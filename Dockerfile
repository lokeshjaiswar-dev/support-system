FROM node:22-alpine

WORKDIR /app

COPY backend ./backend
COPY frontend ./frontend

RUN cd backend && npm install
RUN cd frontend && npm install && npm run build

EXPOSE 5000

CMD ["sh", "-c", "cd backend && npm start"]