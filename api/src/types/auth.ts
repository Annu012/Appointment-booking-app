export interface AuthTokenPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}