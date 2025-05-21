import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import connectDB from "./config/db.js";
import userRoute from "./routes/userRoute.js";
import bookRoutes from "./routes/bookRoute.js";
import orderRoutes from "./routes/orderRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import mailRoutes from "./routes/mailRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import bodyParser from "body-parser";
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import { startScheduler } from './utils/scheduler.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Authorization']
}));

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

const PORT = process.env.PORT || 8000;

connectDB();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "File size is too large. Maximum size is 5MB"
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
});

app.use("/api", userRoute); 
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/mails", mailRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Resource not found"
  });
});

startScheduler();

const startServer = (port) => {
    const server = app.listen(port)
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is busy, trying ${port + 1}...`);
                startServer(port + 1);
            } else {
                console.error('Server error:', err);
            }
        })
        .on('listening', () => {
            const actualPort = server.address().port;
            console.log(`🚀 Server is running on port ${actualPort}`);
        });
};

startServer(PORT);
