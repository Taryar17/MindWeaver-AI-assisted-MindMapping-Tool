import { randomBytes } from "crypto";

export const generateOTP = () => {
  return (parseInt(randomBytes(3).toString("hex"), 16) % 900000) + 100000; // Generates a 6-digit OTP
};

export const generateToken = () => {
  return randomBytes(32).toString("hex"); // Generates a random token
};
