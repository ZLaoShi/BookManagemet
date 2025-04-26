import { TextField, Text } from '@radix-ui/themes';
import { UserInfo } from '../../../types/userInfo';
import { BaseUserInfoEdit, BaseUserInfoFormData } from './baseUserInfoEdit';
import { useState } from 'react';

interface AdminUserInfoFormData extends BaseUserInfoFormData {
  maxBorrowBooks: number;
}

interface AdminUserInfoEditProps {
  userInfo: UserInfo;
  onSave: (data: AdminUserInfoFormData) => Promise<void>;
  onCancel: () => void;
}

export const AdminUserInfoEdit = ({ userInfo, onSave, onCancel }: AdminUserInfoEditProps) => {
  const [maxBorrowBooks, setMaxBorrowBooks] = useState(userInfo.maxBorrowBooks || 0);

  const handleSave = async (baseData: BaseUserInfoFormData) => {
    await onSave({
      ...baseData,
      maxBorrowBooks
    });
  };

  return (
    <BaseUserInfoEdit
      userInfo={userInfo}
      onSave={handleSave}
      onCancel={onCancel}
    >
      <div>
        <Text as="label" size="2" weight="bold">
          最大借书数量
        </Text>
        <TextField.Root
            type="number"
            min="0"
            placeholder="请输入最大借书数量"
            value={maxBorrowBooks}
            onChange={(e) => setMaxBorrowBooks(parseInt(e.target.value) || 0)}
          >
        </TextField.Root>
      </div>
    </BaseUserInfoEdit>
  );
};