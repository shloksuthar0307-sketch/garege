// TODO: Migrate from localStorage JWT storage to httpOnly cookies for better security
export const getAccessToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem('refreshToken');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};
