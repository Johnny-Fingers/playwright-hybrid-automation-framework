import { APIRequestContext, APIResponse } from "@playwright/test";
import { CreateCommentPayload } from "../models/comment.model.js";

export class CommentController {
    constructor(private request: APIRequestContext) {}

    // Add new comment to an article
    async create(slug: string, payload: CreateCommentPayload, token: string): Promise<APIResponse> {
        return await this.request.post(`/api/articles/${slug}/comments`, {
            data: payload,
            headers: {
                Authorization: `Token ${token}`
            }
        });
    }
}