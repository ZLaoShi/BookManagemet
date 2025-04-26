import { atom } from 'jotai';
import { authAtom } from './authAtoms';
import { parseJwt } from '../utils/jwt';

export const loginAction = atom(
  null,
  (get, set, { token, username }: { token: string; username: string }) => {
    const decoded = parseJwt(token);
    const userId = decoded?.sub;
    const isAdmin = decoded?.role === '1';

    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    
    set(authAtom, {
      isAuthenticated: true,
      username,
      token,
      userId,
      isAdmin
    });
  }
);

export const logoutAction = atom(null, (get, set) => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  
  set(authAtom, {
    isAuthenticated: false,
    username: null,
    token: null,
    userId: null,
    isAdmin: false
  });
});
//TODO 退出登录后没有直接回到首页