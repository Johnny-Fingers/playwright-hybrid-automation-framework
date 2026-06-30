// Required structure for login (POST /api/users/login)
export interface UserLoginPayload {
    user: {
        email: string;
        password: string;
    };    
}

// Required structure for registration (POST /api/users)
export interface UserRegisterPayload {
    user: {
        username: string;
        email: string;
        password: string;
    };
}

// Structure returned by the API following a successful login or registration
export interface UserResponse {
    user: {
        email: string;
        token: string;
        username: string;
        bio: string | null;
        image: string | null;
    };
}

// Structure to catch errors from the API
export interface AuthErrorResponse {
    errors: {
        [key: string]: string[];
    };
}