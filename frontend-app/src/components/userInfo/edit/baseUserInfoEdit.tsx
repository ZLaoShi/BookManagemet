import { TextField, Button, Flex, Text } from '@radix-ui/themes';
import { useState } from 'react';
import { UserInfo } from '../../../types/userInfo';
import './baseUserInfoEdit.scss';

export interface BaseUserInfoFormData {
  fullName: string;
  phone: string;
  address: string;
}

interface BaseUserInfoEditProps {
  userInfo: UserInfo;
  onSave: (data: BaseUserInfoFormData) => Promise<void>;
  onCancel: () => void;
  children?: React.ReactNode; // 用于扩展额外的表单字段
}

export const BaseUserInfoEdit = ({ userInfo, onSave, onCancel, children }: BaseUserInfoEditProps) => {
  const [formData, setFormData] = useState<BaseUserInfoFormData>({
    fullName: userInfo.fullName,
    phone: userInfo.phone || '',
    address: userInfo.address || '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = '姓名不能为空';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-info-edit">
      <Flex direction="column" gap="4">
        <div>
          <Text as="label" size="2" weight="bold" className="required-field">
            姓名
          </Text>
          <TextField.Root 
            className={errors.fullName ? 'error' : ''}
              placeholder="请输入姓名"
              value={formData.fullName}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, fullName: e.target.value }));
                if (errors.fullName) {
                  setErrors(prev => ({ ...prev, fullName: '' }));
                }
              }}
            >
          </TextField.Root>
          {errors.fullName && (
            <Text className="error-message">{errors.fullName}</Text>
          )}
        </div>

        <div>
          <Text as="label" size="2" weight="bold">
            电话
          </Text>
          <TextField.Root
              placeholder="请输入电话号码"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            >
          </TextField.Root>
        </div>

        <div>
          <Text as="label" size="2" weight="bold">
            地址
          </Text>
          <TextField.Root       
              placeholder="请输入地址"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            >
          </TextField.Root>
        </div>

        {children}

        <Flex gap="3" justify="end" className="form-buttons">
          <Button variant="soft" onClick={onCancel} type="button">
            取消
          </Button>
          <Button type="submit">
            保存
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};