export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  created_at: string | Date;
}

export interface HealthCheckResponse {
  status: string;
  uptime: number;
  database: {
    ok: boolean;
    message: string;
  };
}
