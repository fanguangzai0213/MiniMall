export interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
