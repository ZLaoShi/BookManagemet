// 用于本地存储的常量
const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

// 获取token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// 保存token
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// 移除token
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// 获取用户名
export const getUsernameFromStorage = (): string | null => {
  return localStorage.getItem(USERNAME_KEY);
};

// 保存用户名
export const saveUsername = (username: string): void => {
  localStorage.setItem(USERNAME_KEY, username);
};

// 移除用户名
export const removeUsername = (): void => {
  localStorage.removeItem(USERNAME_KEY);
};