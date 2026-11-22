import { sendSMS } from './notification.js';

export function createOtp(phone) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(phone, { code, expires: Date.now() + 10 * 60 * 1000 });
  console.log(`[OTP] ${phone}: ${code}`);
  sendSMS(phone, `Your LifeLink code is ${code}. It expires in 10 minutes.`).catch((err) =>
    console.error(`OTP SMS to ${phone} failed: ${err.message}`)
  );
  return code;
}