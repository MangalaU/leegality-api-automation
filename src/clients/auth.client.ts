
import { APIRequestContext, APIResponse } from '@playwright/test';

import { API_CONFIG } from '../config/api.config';

export interface AuthCredentials {
  username: string;
  password: string;
}

export class AuthClient {
  constructor(
    private request: APIRequestContext
  ) {}

  async createToken(
    credentials: AuthCredentials
  ): Promise<APIResponse> {
    return await this.request.post(
      API_CONFIG.ENDPOINTS.AUTH,
      {
        data: credentials,
      }
    );
  }
}
