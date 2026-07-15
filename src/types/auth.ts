export interface JwtPayload {
  id: string;
  username: string;
  role: string;
  enabled?: boolean;
  allowedRoutes?: string[];
}

export interface JwtResponse {
  id: string;
  username: string;
  role: string;
  token: string;
  refreshToken?: string;
  enabled?: boolean;
  allowedRoutes?: string[];
}
