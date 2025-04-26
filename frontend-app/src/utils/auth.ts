import { removeToken, removeUsername } from './localStorage';

/**
 * 登出并重定向到登录页
 */
export const logoutAndRedirect = () => {
  // 直接调用 localStorage 方法清除令牌
  removeToken();
  removeUsername();
  
  // 显示提示信息
  const messageElement = document.createElement('div');
  messageElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #f59e0b;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 2000;
    animation: slideIn 0.2s ease-out;
  `;
  messageElement.textContent = '登录状态已过期，请重新登录';
  document.body.appendChild(messageElement);
  
  // 3秒后移除提示信息
  setTimeout(() => {
    messageElement.style.animation = 'slideOut 0.2s ease-in';
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 200);
  }, 3000);
  
  // 重定向到登录页
  window.location.href = '/login';
};

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);