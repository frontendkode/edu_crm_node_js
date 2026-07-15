import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const AES_KEY = process.env.AES_KEY;
if (!AES_KEY) {
  throw new Error('AES_KEY must be defined in environment variables.');
}

const key = CryptoJS.enc.Utf8.parse(AES_KEY);

export const encryptPayload = (data: unknown): string => {
  const plaintext = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

export const decryptPayload = (encryptedData: string): unknown => {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedText);
};
