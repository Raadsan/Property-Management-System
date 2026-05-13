import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { prisma } from "./lib/prisma.js";

// Import Routes
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
import reportRoute from "./Routes/reportRoute.js";
import videoRoute from "./Routes/videoRoute.js";

import multerErrorHandler from "./middlewares/multerErrorHandler.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Alias middleware for frontend compatibility (_id -> id)
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    const addAlias = (obj) => {
      if (!obj || typeof obj !== 'object' || obj instanceof Date) return obj;
      if (Array.isArray(obj)) return obj.map(addAlias);
      const newObj = { ...obj };
      if (newObj.id && !newObj._id) newObj._id = String(newObj.id);

      for (const key in newObj) {
        newObj[key] = addAlias(newObj[key]);
        if (typeof key === 'string' && key.toLowerCase().endsWith('id') && newObj[key] !== null && newObj[key] !== undefined && typeof newObj[key] !== 'object') {
          newObj[key] = String(newObj[key]);
        }
      }
      return newObj;
    };
    return originalJson.call(this, addAlias(data));
  };
  next();
});

// Basic health check route
app.get('/', (req, res) => {
  res.send("🚀 Property Management System API is running!");
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: "Property Management Backend is running!" });
});

// API Routes
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
app.use('/api/reports', reportRoute);
app.use('/api/videos', videoRoute);

// Error Handling Middleware
app.use(multerErrorHandler);

// Startup logic
async function main() {
  try {
    console.log('Connecting to MySQL database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to the MySQL database!');

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

// Soft shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
