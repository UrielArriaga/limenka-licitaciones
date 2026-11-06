export interface UserData {
  id: string;
  username: string;
  isonline?: boolean;
  email?: string;
  role?: string;
  name?: string;
  [key: string]: any;
}

export interface LoginApiResponse {
  data: UserData;
  refreshToken: string;
  tokenSession: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: UserData;
  tokenSession: string;
  refreshToken: string;
}
