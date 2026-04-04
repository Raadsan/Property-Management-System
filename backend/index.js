import 'dotenv/config';
import express from 'express';
import { prisma } from "./lib/prisma.js";
import roleRoute from "./Routes/roleRoute.js";
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json({ type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ extended: true }));    

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'connected' });
});

// Routes
app.use('/api/roles', roleRoute);


async function main() {
  try {
    console.log('Connecting to MySQL database...');

    // Attempt to connect
    await prisma.$connect();
    console.log('✅ Successfully connected to the MySQL database!');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
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

