import { Table, Text } from '@radix-ui/themes';
import { UserInfo } from '../../../types/userInfo';
import './userInfoDisplay.scss'

interface UserInfoDisplayProps {
  userInfo: UserInfo | undefined;
}

export const UserInfoDisplay = ({ userInfo }: UserInfoDisplayProps) => {
  return (
    <Table.Root className="user-info-table">
      <Table.Body>
        <Table.Row>
          <Table.Cell>姓名</Table.Cell>
          <Table.Cell>{userInfo?.fullName}</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>电话</Table.Cell>
          <Table.Cell>{userInfo?.phone || '未设置'}</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>地址</Table.Cell>
          <Table.Cell>{userInfo?.address || '未设置'}</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>最大借阅数量</Table.Cell>
          <Table.Cell>{userInfo?.maxBorrowBooks} 本</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>注册时间</Table.Cell>
          <Table.Cell>
            {new Date(userInfo?.createdAt || '').toLocaleString()}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
};