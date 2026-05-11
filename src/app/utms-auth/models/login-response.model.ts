export interface LoginResponse {
  refresh: string;
  access: string;
  redirect_url?: string;
  id_token: string;
}
