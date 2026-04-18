import express from 'express';
import cors from 'cors';
import { userRouter } from './routes/user/user.routes';
import { otpRouter } from './routes/otp/otp.routes';
import { faceRouter } from './routes/face/face.routes';
import { companyRouter } from './routes/company/company.routes';
import { postRouter } from './routes/post/post.routes';
import { paymentRouter } from './routes/payment/payment.routes';
import { adminRouter } from './routes/admin/admin.routes';
import { eventRouter } from './routes/event/event.routes';
import { errorMiddleware } from './middlewares/error/error.middleware';

const app = express();

// Middlewares
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"],
  credentials: true,
}));

app.use(express.json({ limit: '5mb' })); // larger limit for descriptor arrays

// Routes
app.use('/user', userRouter);
app.use('/verify', otpRouter);
app.use('/face', faceRouter);
app.use('/company', companyRouter);
app.use('/post', postRouter);
app.use('/payment', paymentRouter);
app.use('/admin', adminRouter);
app.use('/event', eventRouter);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Project-Management Backend API is running' });
});

// Error handling middleware (must be last)
app.use(errorMiddleware as any);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
