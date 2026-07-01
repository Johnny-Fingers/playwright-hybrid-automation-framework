// Structure for creating article (POST /api/articles)
export interface CreateArticlePayload {
    article: {
        title: string;
        description: string;
        body: string;
        tagList: string[];
    };
}

// Structure returned by the API when retrieving or creating an article 
export interface ArticleResponse {
    article: {
        slug: string,
        title: string,
        description: string,
        body: string,
        tagList: string[],
        createdAt: string;
        updatedAt: string;
        favorited: boolean;
        favoritesCount: number;
        author: {
            username: string;
            bio: string | null;
            image: string;
            following: boolean;
        };
    };
}