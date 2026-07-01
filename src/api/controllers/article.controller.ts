import { APIRequestContext, APIResponse } from "@playwright/test";
import { CreateArticlePayload } from "../models/article.model.js";

export class ArticleController {
    constructor(private request: APIRequestContext) {}

    // Create new article
    async create(payload: CreateArticlePayload, token: string): Promise<APIResponse> {
        return await this.request.post("/api/articles", {
            data: payload,
            headers: {
                Authorization: `Token ${token}`
            }
        });
    }

    // Get an article by its slug
    async get(slug: string, token: string): Promise<APIResponse> {
        return await this.request.get(`/api/articles/${slug}`, {
            headers: token ? { Authorization: `Token ${token}` } : {}
        });
    }

    // Delete an article by its slug
    async delete(slug: string, token: string): Promise<APIResponse> {
        return await this.request.delete(`/api/articles/${slug}`, {
            headers: {
                Authorization: `Token ${token}`
            }
        });
    }
}