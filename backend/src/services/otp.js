import { sendSMS } from './notification.js';

const store = new Map(); // phone -> { code, expires }

export function createOtp(phone) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(phone, { code, expires: Date.now() + 10 * 60 * 1000 });
  console.log(`[OTP] ${phone}: ${code}`); // fallback if SMS fails
  sendSMS(phone, `Your LifeLink code is ${code}. It expires in 10 minutes.`).catch((err) =>
    console.error(`OTP SMS to ${phone} failed: ${err.message}`)
  );
  return code;
}

export function checkOtp(phone, code) {
  const entry = store.get(phone);
  if (!entry || entry.expires < Date.now() || entry.code !== code) return false;
  store.delete(phone);
  return true;
}