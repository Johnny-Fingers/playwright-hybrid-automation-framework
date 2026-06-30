import { APIRequestContext, APIResponse } from "@playwright/test";
import { UserLoginPayload, UserRegisterPayload } from "../models/user.model.js";

export class AuthController {
    constructor(private request: APIRequestContext) {}

    // Authenticate an existing user
    async login(payload: UserLoginPayload): Promise<APIResponse> {
        return await this.request.post("/api/users/login", {
            data: payload
        });
    }

    // Register a new user
    async register(payload: UserRegisterPayload): Promise<APIResponse> {
        return await this.request.post("/api/users", {
            data: payload
        });
    }

    // Get an authenticated user using their token
    async getCurrentUser(token: string): Promise<APIResponse> {
        return await this.request.get("/api/user", {
            headers: {
                Authorization: `Token ${token}`
            }
        });
    }
}