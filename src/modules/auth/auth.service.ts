import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async googleLogin(user: any) {
    if (!user) {
      return 'No user from Google';
    }

    // ✅ Here you should:
    // 1. Find user in DB by email
    // 2. If not exist → create user
    // 3. Generate JWT Token

    return {
      message: 'Google login successful',
      user,
    };
  }
}
