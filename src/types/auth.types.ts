export interface User {
  id: string;
  email: string;
  isEmailVerified: boolean;
}

export interface LoginResponse {
  access_token: string;
  user: User;
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailResponse {
  message: string;
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthError {
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface CurrentUserResponse {
  userId: string;
  email: string;
}

// OTP Authentication
export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message: string;
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  access_token: string;
  user: User;
  message: string;
}

