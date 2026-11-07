export interface UserData {
  id: string;
  username: string;
  roleId?: string;
  role?: string;
  rol?: string;
  name?: string;
  lastname?: string;
  email?: string;
  group?: string;
  groupId?: string;
  phone?: string;
  type?: string;
  isonline?: boolean;
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
