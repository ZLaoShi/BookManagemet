import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { 
  Dialog, 
  Flex, 
  Button, 
  Text, 
  Badge, 
  TextArea, 
  Select 
} from '@radix-ui/themes';
import { 
  BorrowStatus, 
  getBorrowStatusText, 
  getBorrowStatusColor 
} from '../../../types/borrowRecord';
import { 
  ADMIN_RETURN_BOOK, 
  ADMIN_FORCE_RETURN 
} from '../../../graphql/mutations/admin/borrowRecord';

interface Book {
  id: string;
  title: string;
  author: string;
}

interface BorrowRecord {
  id: string;
  book: Book;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminBorrowRecordActionProps {
  record: BorrowRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

export const AdminBorrowRecordAction = ({
  record,
  open,
  onOpenChange,
  onSuccess,
  onError
}: AdminBorrowRecordActionProps) => {
  const [remarks, setRemarks] = useState(record.remarks || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(record.status.toString());
  
  const [adminReturnBook, { loading: returningBook }] = useMutation(ADMIN_RETURN_BOOK, {
    onCompleted: () => {
      onSuccess(`《${record.book.title}》已成功归还`);
      onOpenChange(false);
    },
    onError: (error) => {
      onError(`归还失败: ${error.message}`);
    }
  });

  const [adminForceReturn, { loading: forceReturning }] = useMutation(ADMIN_FORCE_RETURN, {
    onCompleted: () => {
      onSuccess(`《${record.book.title}》状态已成功更新为: ${getBorrowStatusText(parseInt(selectedStatus) as BorrowStatus)}`);
      onOpenChange(false);
    },
    onError: (error) => {
      onError(`更新状态失败: ${error.message}`);
    }
  });

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '未设置';
    return new Date(dateString).toLocaleDateString();
  };

  const handleNormalReturn = async () => {
    try {
      await adminReturnBook({
        variables: {
          recordId: record.id,
          remarks
        }
      });
    } catch (error) {
      // 错误已在 onError 回调中处理
    }
  };

  const handleForceReturn = async () => {
    try {
      await adminForceReturn({
        variables: {
          recordId: record.id,
          status: parseInt(selectedStatus),
          remarks
        }
      });
    } catch (error) {
      // 错误已在 onError 回调中处理
    }
  };

  const canNormalReturn = record.status === BorrowStatus.BORROWED || record.status === BorrowStatus.OVERDUE;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>处理借阅记录</Dialog.Title>
        
        <Flex direction="column" gap="4" mt="4">
          <Flex gap="4" wrap="wrap">
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">书名</Text>
              <Text>{record.book.title}</Text>
            </Flex>
            
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">作者</Text>
              <Text>{record.book.author}</Text>
            </Flex>
            
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">借阅日期</Text>
              <Text>{formatDate(record.borrowDate)}</Text>
            </Flex>
            
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">应还日期</Text>
              <Text>{formatDate(record.dueDate)}</Text>
            </Flex>
            
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">实际归还日期</Text>
              <Text>{record.returnDate ? formatDate(record.returnDate) : '-'}</Text>
            </Flex>
            
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">当前状态</Text>
              <Badge color={getBorrowStatusColor(record.status)}>
                {getBorrowStatusText(record.status)}
              </Badge>
            </Flex>
          </Flex>
          
          <Flex direction="column" gap="2">
            <Text as="label" size="2" weight="bold">
              备注
            </Text>
            <TextArea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="添加处理备注..."
            />
          </Flex>
          
          {canNormalReturn && (
            <Flex justify="end" mt="2">
              <Button
                variant="solid"
                onClick={handleNormalReturn}
                disabled={returningBook || forceReturning}
              >
                {returningBook ? '处理中...' : '正常归还'}
              </Button>
            </Flex>
          )}
          
          <Flex direction="column" gap="3">
            <Text size="2" weight="bold">强制更改状态</Text>
            <Flex gap="3" align="end">
              <Select.Root 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
                size="2"
                disabled={forceReturning}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="0">借阅中</Select.Item>
                  <Select.Item value="1">已归还</Select.Item>
                  <Select.Item value="2">逾期未还</Select.Item>
                  <Select.Item value="3">已损坏/丢失</Select.Item>
                </Select.Content>
              </Select.Root>
              
              <Button
                variant="soft"
                onClick={handleForceReturn}
                disabled={returningBook || forceReturning || selectedStatus === record.status.toString()}
              >
                {forceReturning ? '处理中...' : '强制更新状态'}
              </Button>
            </Flex>
          </Flex>
        </Flex>
        
        <Flex gap="3" mt="6" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">关闭</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};