// Structure for adding a comment (POST /api/articles/:slug/comments)
export interface CreateCommentPayload {
    "comment": {
        "body": string;
    };
}

// Structure returned by the API when retrieving comments
export interface CommentResponse {
    "comment": {
        "id": number;
        "createdAt": string;
        "updatedAt": string;
        "body": string;
        "author": {
            "username": string;
            "bio": string | null;
            "image": string;
            "following": boolean;
        };
    };
}