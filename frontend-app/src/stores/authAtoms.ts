import { atom, createStore } from 'jotai';
import { getToken, getUsernameFromStorage } from '../utils/localStorage';
import { parseJwt } from '../utils/jwt';

// 定义认证状态的接口
export interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  isAdmin: boolean;
}

// 创建一个全局存储实例
const authStore = createStore();

// 从本地存储和JWT解析初始状态
const getInitialState = (): AuthState => {
  const token = getToken();
  const username = getUsernameFromStorage();
  
  if (token) {
    const decoded = parseJwt(token);
    return {
      token,
      username: username || '',
      isAuthenticated: true,
      userId: decoded?.sub || null,
      isAdmin: decoded?.role === '1'
    };
  }
  
  return {
    token: null,
    username: null,
    isAuthenticated: false,
    userId: null,
    isAdmin: false
  };
};

// 创建auth相关状态
export const authAtom = atom<AuthState>(getInitialState());

// 创建衍生原子 - 是否为管理员
export const isAdminAtom = atom((get) => {
  const auth = get(authAtom);
  return auth.isAuthenticated && auth.isAdmin;
});

// 创建衍生原子 - 是否已认证
export const isAuthenticatedAtom = atom((get) => {
  return get(authAtom).isAuthenticated;
});

// 获取Auth Store的函数，用于外部访问
export const getAuthStore = () => authStore;

// 导出认证原子和相关函数
export default {
  authAtom,
  getAuthStore
};