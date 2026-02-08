import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import orderRoutes from './routes/orders';
import productRoutes from './routes/products';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

app.listen(port, () => {
    console.log(`API Server running at http://localhost:${port}`);
});
