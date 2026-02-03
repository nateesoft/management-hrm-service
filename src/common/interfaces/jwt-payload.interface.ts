export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

export interface CurrentUserData {
  id: number;
  username: string;
  role: string;
  name: string;
}
