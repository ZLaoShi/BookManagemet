import { useState } from 'react';
import { useAtom } from 'jotai';
import { useMutation } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Card, Flex, Text, TextField } from '@radix-ui/themes';
import { LOGIN } from '../../graphql/mutations/auth';
import { loginAction } from '../../stores/authActions';
import { parseJwt } from '../../utils/jwt';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [,login] = useAtom(loginAction);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loginMutation, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const token = data.login.token;
      const decoded = parseJwt(token);
      const isAdmin = decoded?.role === '1';
      
      // 使用 action 来更新状态
      login({
        token: token,
        username: data.login.username
      });

      // 根据用户角色决定跳转目标
      if (isAdmin) {
        // 管理员用户跳转到管理后台
        navigate('/admin', { replace: true });
      } else {
        // 普通用户跳转到之前的页面或首页
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('请填写用户名和密码');
      return;
    }
    
    try { 
      await loginMutation({
        variables: {
          username,
          password,
        },
      });
    } catch (err) {
      // GraphQL 错误已在 onError 中处理
    }
  };

  return (
    <Flex justify="center" align="center" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <Card size="3" style={{ width: '100%', maxWidth: '400px' }}>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4" p="4">
            <Text size="5" weight="bold" align="center">登录</Text>
            
            <Box>
              <TextField.Root
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                >
              </TextField.Root>
            </Box>

            <Box>
              <TextField.Root 
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              >
              </TextField.Root>
            </Box>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>

            <Flex justify="center" gap="2">
              <Text size="2">还没有账号？</Text>
              <Text 
                size="2" 
                color="blue" 
                onClick={() => navigate('/register')}
                style={{ cursor: 'pointer' }}
              >
                去注册
              </Text>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
};