import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email contains invalid characters. Greek/non-English inputs are blocked.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email contains invalid characters. Greek/non-English inputs are blocked.'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email format').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email contains invalid characters. Greek/non-English inputs are blocked.'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email contains invalid characters. Greek/non-English inputs are blocked.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const resendOTPSchema = z.object({
  email: z.string().email('Invalid email format').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email contains invalid characters. Greek/non-English inputs are blocked.'),
  type: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'LOGIN']),
});
