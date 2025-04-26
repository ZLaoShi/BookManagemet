import { UserInfo } from '../../../types/userInfo';
import { BaseUserInfoEdit, BaseUserInfoFormData } from './baseUserInfoEdit';

interface UserInfoEditProps {
  userInfo: UserInfo;
  onSave: (data: BaseUserInfoFormData) => Promise<void>;
  onCancel: () => void;
}

export const UserInfoEdit = (props: UserInfoEditProps) => {
  return <BaseUserInfoEdit {...props} />;
};