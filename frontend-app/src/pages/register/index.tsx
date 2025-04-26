import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Flex, Text, TextField } from '@radix-ui/themes';
import { REGISTER } from '../../graphql/mutations/auth';
import './index.scss';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [register, { loading }] = useMutation(REGISTER, {
    onCompleted: () => {
      // 注册成功后跳转到登录页
      navigate('/login', { 
        state: { message: '注册成功，请登录' }
      });
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    }
    
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度不能小于6位';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    if (!formData.email) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await register({
        variables: {
          input: {
            username: formData.username,
            password: formData.password,
            email: formData.email
          }
        }
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
            <Text size="5" weight="bold" align="center">注册</Text>
            
            <Box>
              <TextField.Root
                  placeholder="用户名"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, username: e.target.value }));
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: '' }));
                    }
                  }}
                >
              </TextField.Root>
              {errors.username && (
                <Text color="red" size="2">{errors.username}</Text>
              )}
            </Box>

            <Box>
              <TextField.Root
                  type="password"
                  placeholder="密码"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                >
              </TextField.Root>
              {errors.password && (
                <Text color="red" size="2">{errors.password}</Text>
              )}
            </Box>

            <Box>
              <TextField.Root
                  type="password"
                  placeholder="确认密码"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                >
              </TextField.Root>
              {errors.confirmPassword && (
                <Text color="red" size="2">{errors.confirmPassword}</Text>
              )}
            </Box>

            <Box>
              <TextField.Root
                  type="email"
                  placeholder="邮箱"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                >
              </TextField.Root>
              {errors.email && (
                <Text color="red" size="2">{errors.email}</Text>
              )}
            </Box>

            {errors.submit && (
              <Text color="red" size="2">{errors.submit}</Text>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </Button>

            <Flex justify="center" gap="2">
              <Text size="2">已有账号？</Text>
              <Text 
                size="2" 
                color="blue" 
                onClick={() => navigate('/login')}
                style={{ cursor: 'pointer' }}
              >
                去登录
              </Text>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
};