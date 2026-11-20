import { Router } from 'express';
import { validate } from '../middleware/valid.js';
import {
  register, login, verifyOtp,
  registerSchema, loginSchema, otpSchema,resendOtp,
} from '../controllers/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/otp/verify', validate(otpSchema), verifyOtp);
router.post('/login', validate(loginSchema), login);
router.post('/otp/resend', resendOtp);
export default router;