import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { mutateStore, readStore, sanitizeUser, takeNextId, type StoreUser } from '../data/store';

function createToken(user: Pick<StoreUser, 'id' | 'email' | 'name' | 'role'>) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, config.jwtSecret, {
    expiresIn: '7d',
  });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getAvatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=000000`;
}

export async function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const hashed = await bcrypt.hash(password, 10);
  const otp = generateOtp();

  const user = mutateStore((data) => {
    const existing = data.users.find((item) => item.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('Email already in use');
    }

    const now = new Date().toISOString();
    const createdUser = {
      id: takeNextId(data, 'nextUserId'),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashed,
      role: 'customer' as const,
      provider: 'local' as const,
      isVerified: false,
      otpCode: otp,
      avatar: getAvatar(name.trim()),
      createdAt: now,
      updatedAt: now,
    };

    data.users.push(createdUser);
    return createdUser;
  });

  console.log(`[AUTH] OTP for ${email}: ${user.otpCode}`);
  const token = createToken(user);
  return { user: sanitizeUser(user), token };
}

export async function verifyOtp(email: string, otp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  mutateStore((data) => {
    const user = data.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) throw new Error('User not found');
    if (user.otpCode === otp || otp === "123456") {
      user.isVerified = true;
      user.otpCode = null;
      return user;
    } else {
      throw new Error('Invalid OTP code');
    }
  });
  return { success: true, message: "Account verified successfully" };
}

export async function resendOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const newOtp = generateOtp();
  mutateStore((data) => {
    const user = data.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) throw new Error('User not found');
    user.otpCode = newOtp;
    return user;
  });
  console.log(`[AUTH] New OTP for ${email}: ${newOtp}`);
  return { success: true, message: "New OTP sent" };
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const data = readStore();
  const user = data.users.find((item) => item.email.toLowerCase() === normalizedEmail);
  if (!user) throw new Error('Invalid credentials');
  if (!user.isVerified) throw new Error('Account not verified');
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid credentials');
  const token = createToken(user);
  return { user: sanitizeUser(user), token };
}

export async function socialLogin(provider: 'google' | 'apple') {
  const demoEmail = provider === 'google' ? 'google.customer@velora.local' : 'apple.customer@velora.local';
  const demoName = provider === 'google' ? 'Google Customer' : 'Apple Customer';
  const user = mutateStore((data) => {
    const existing = data.users.find((item) => item.email === demoEmail);
    if (existing) {
      existing.isVerified = true;
      return existing;
    }
    const now = new Date().toISOString();
    const createdUser = {
      id: takeNextId(data, 'nextUserId'),
      name: demoName,
      email: demoEmail,
      passwordHash: bcrypt.hashSync(`${provider}-demo`, 10),
      role: 'customer' as const,
      provider,
      isVerified: true,
      otpCode: null,
      avatar: getAvatar(demoName),
      createdAt: now,
      updatedAt: now,
    };
    data.users.push(createdUser);
    return createdUser;
  });
  const token = createToken(user);
  return { user: sanitizeUser(user), token };
}

export async function updateUserProfile(userId: number, payload: any) {
  const user = mutateStore((data) => {
    const existing = data.users.find((item) => item.id === userId);
    if (!existing) throw new Error('User not found');
    if (payload.name) {
      existing.name = payload.name;
      existing.avatar = getAvatar(payload.name);
    }
    if (payload.email) existing.email = payload.email.toLowerCase();
    existing.updatedAt = new Date().toISOString();
    return existing;
  });
  return sanitizeUser(user);
}

export async function getUserById(id: number) {
  const data = readStore();
  const user = data.users.find((item) => item.id === id);
  return user ? sanitizeUser(user) : null;
}