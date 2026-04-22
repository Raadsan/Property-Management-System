import 'dotenv/config';
import express from 'express';
import { prisma } from "./lib/prisma.js";
import roleRoute from "./Routes/roleRoute.js";
import userRoute from "./Routes/userRoute.js";
import propertyTypeRoute from "./Routes/propertyTypeRoute.js";
import PropertyRoute from "./Routes/PropertyRoute.js";
import paymentRoute from "./Routes/paymentRoute.js";

import favoriteRoute from "./Routes/favoriteRoute.js";
import menuRoute from "./Routes/menuRoute.js";
import rolePermissionsRoute from "./Routes/rolePermissionsRoute.js";
import dashboardRoute from "./Routes/dashboardRoute.js";
import contactRoute from "./Routes/contactRoute.js";
import blogRoute from "./Routes/blogRoute.js";
import blogCategoryRoute from "./Routes/blogCategoryRoute.js";

import path from 'path';
import cors from 'cors';


const app = express();
app.use(cors());
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(express.json({ limit: '30mb', type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Serve static uploads
app.use('/uploads', express.static('uploads'));

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'connected' });
});

// Routes
app.use('/api/roles', roleRoute);
app.use('/api/users', userRoute);
app.use('/api/property-types', propertyTypeRoute);
app.use('/api/properties', PropertyRoute);
app.use('/api/payments', paymentRoute);

app.use('/api/favorites', favoriteRoute);
app.use('/api/menus', menuRoute);
app.use('/api/role-permissions', rolePermissionsRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/contact', contactRoute);
app.use('/api/blogs', blogRoute);
app.use('/api/blog-categories', blogCategoryRoute);






// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err);
  
  // Handle specific Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: "File upload error",
      error: err.message,
      code: err.code
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: typeof err === 'object' ? err : String(err),
    details: err.stack ? "Check server logs for stack trace" : undefined
  });
});

async function main() {
  try {
    console.log('Connecting to MySQL database...');

    // Attempt to connect
    await prisma.$connect();
    console.log('✅ Successfully connected to the MySQL database!');

    const PORT = process.env.PORT || 5001;
    const HOST = '0.0.0.0';
    
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📡 Accessible at http://localhost:${PORT} and public IP`);
    });

  } catch (error) {
    console.error('❌ Error connecting to MySQL:', error.message);
    process.exit(1);
  }
}

main();

// Soft shutdown to handle database disconnection
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

