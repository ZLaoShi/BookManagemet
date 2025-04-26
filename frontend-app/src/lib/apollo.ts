import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { getToken } from '../utils/localStorage';
import { logoutAndRedirect } from '../utils/auth';

// 创建HTTP链接
const httpLink = createHttpLink({
  uri: 'http://192.168.0.102:8888/graphql',
});
//请根据实际情况修改

// 错误处理链接
const errorLink = onError(({ networkError, graphQLErrors }) => {
  // 检查网络错误
  if (networkError && 'statusCode' in networkError) {
    // 401 未授权错误，自动登出
    if (networkError.statusCode === 401) {
      logoutAndRedirect();
    }
  }

  // 检查GraphQL错误
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      // 如果GraphQL错误中包含未授权信息
      if (
        extensions?.code === 'UNAUTHENTICATED' || 
        message?.includes('权限') || 
        message?.includes('未登录') ||
        message?.includes('Unauthorized') ||
        message?.includes('Token') ||
        message?.includes('token')
      ) {
        logoutAndRedirect();
      }
    });
  }
});

// 授权链接
const authLink = setContext((_, { headers }) => {
  // 从本地存储获取令牌
  const token = getToken();
  
  // 如果有token，在请求头中添加
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// 创建Apollo客户端
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
