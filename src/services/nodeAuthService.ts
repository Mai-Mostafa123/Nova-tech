import type { AuthResponse, RegisterResponse, UserProfile } from '../types';
import { storefrontApi } from './storefrontApi';

export type User = UserProfile;

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    return storefrontApi.register({ name, email, password });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await storefrontApi.login({ email, password });
    this.setToken(data.token);
    return data;
  }

  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const data = await storefrontApi.verifyOtp({ email, otp });
    this.setToken(data.token);
    return data;
  }

  async resendOtp(email: string): Promise<RegisterResponse> {
    return storefrontApi.resendOtp(email);
  }

  async socialLogin(provider: 'google' | 'apple'): Promise<AuthResponse> {
    const data = await storefrontApi.socialLogin(provider);
    this.setToken(data.token);
    return data;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authAPI = new AuthService();
