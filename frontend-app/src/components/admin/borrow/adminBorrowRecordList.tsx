import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Table, Badge, Button, Flex, Text } from '@radix-ui/themes';
import { 
  BorrowStatus, 
  getBorrowStatusText, 
  getBorrowStatusColor,
  BorrowRecord
} from '../../../types/borrowRecord';
import { 
  ADMIN_RETURN_BOOK, 
  ADMIN_FORCE_RETURN 
} from '../../../graphql/mutations/admin/borrowRecord';
import { AdminBorrowRecordAction } from './adminBorrowRecordAction';
import './adminBorrowRecordList.scss';

// interface Book {
//   id: string;
//   title: string;
//   author: string;
// }

// interface BorrowRecord {
//   id: string;
//   book: Book;
//   borrowDate: string;
//   dueDate: string;
//   returnDate?: string;
//   status: BorrowStatus;
//   remarks?: string;
//   createdAt: string;
//   updatedAt: string;
// }

interface AdminBorrowRecordListProps {
  borrowRecords: BorrowRecord[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
  onMessage: (text: string, success: boolean) => void;
}

export const AdminBorrowRecordList = ({
  borrowRecords,
  currentPage,
  totalPages,
  onPageChange,
  onRefetch,
  onMessage
}: AdminBorrowRecordListProps) => {
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  
  // 格式化日期显示
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '未设置';
    return new Date(dateString).toLocaleDateString();
  };

  // 检查是否即将到期 (7天内)
  const isNearDueDate = (dueDate: string): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // 检查是否已逾期
  const isOverdue = (dueDate: string): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    return today > due && due.getDate() !== today.getDate();
  };

  const handleAction = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setActionModalOpen(true);
  };

  return (
    <>
      <Flex direction="column" gap="4">
        <Table.Root className="admin-borrow-record-table">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>书名</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>作者</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>借阅日期</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>应还日期</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>实际归还日期</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>状态</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {borrowRecords.map((record) => (
              <Table.Row key={record.id}>
                <Table.Cell>{record.book.title}</Table.Cell>
                <Table.Cell>{record.book.author}</Table.Cell>
                <Table.Cell>{formatDate(record.borrowDate)}</Table.Cell>
                <Table.Cell>
                  <Flex direction="column" gap="1">
                    {formatDate(record.dueDate)}
                    {isNearDueDate(record.dueDate) && record.status === BorrowStatus.BORROWED && (
                      <Badge color="orange" size="1">即将到期</Badge>
                    )}
                    {isOverdue(record.dueDate) && record.status === BorrowStatus.BORROWED && (
                      <Badge color="red" size="1">已逾期</Badge>
                    )}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  {record.returnDate ? formatDate(record.returnDate) : '-'}
                </Table.Cell>
                <Table.Cell>
                  <Badge color={getBorrowStatusColor(record.status)}>
                    {getBorrowStatusText(record.status)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Button 
                    size="1" 
                    onClick={() => handleAction(record)}
                  >
                    处理
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <Flex justify="center" gap="2" mt="4" className="pagination">
          <Button 
            variant="soft"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            上一页
          </Button>
          
          <Flex gap="1" align="center">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              // 显示当前页附近的页码
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "solid" : "soft"}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <Text>...</Text>}
                <Button
                  variant="soft"
                  onClick={() => onPageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </Flex>
          
          <Button 
            variant="soft"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            下一页
          </Button>
        </Flex>
      </Flex>

      {selectedRecord && (
        <AdminBorrowRecordAction
          record={selectedRecord}
          open={actionModalOpen}
          onOpenChange={setActionModalOpen}
          onSuccess={(message) => {
            onMessage(message, true);
            onRefetch();
          }}
          onError={(error) => onMessage(error, false)}
        />
      )}
    </>
  );
};