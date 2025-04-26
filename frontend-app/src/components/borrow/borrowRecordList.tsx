import { useState } from 'react';
import { Table, Badge, Button, Flex, Text } from '@radix-ui/themes';
import { BorrowRecord, BorrowStatus, getBorrowStatusText, getBorrowStatusColor } from '../../types/borrowRecord';
import './borrowRecordList.scss';

interface BorrowRecordListProps {
  records: BorrowRecord[];
  onReturn: (recordId: string) => void;
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BorrowRecordList = ({ 
  records, 
  onReturn, 
  loading = false,
  currentPage,
  totalPages,
  onPageChange
}: BorrowRecordListProps) => {
  // 判断是否可以还书
  const canReturn = (record: BorrowRecord): boolean => {
    return record.status === BorrowStatus.BORROWED || record.status === BorrowStatus.OVERDUE;
  };

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

  if (!records || records.length === 0) {
    return (
      <Flex direction="column" align="center" gap="3" py="6">
        <Text size="4">暂无借阅记录</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4">
      <Table.Root className="borrow-record-table">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>书名</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>作者</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>借阅日期</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>应还日期</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>状态</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {records.map((record) => (
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
                <Badge color={getBorrowStatusColor(record.status)}>
                  {getBorrowStatusText(record.status)}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {canReturn(record) && (
                  <Button 
                    size="1" 
                    onClick={() => onReturn(record.id)}
                    disabled={loading}
                  >
                    归还
                  </Button>
                )}
                {record.status === BorrowStatus.RETURNED && (
                  <Text size="1" color="green">已归还</Text>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {records.length > 0 && (
        <Flex justify="center" gap="2" mt="4" className="pagination">
          <Button 
            variant="soft" 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            上一页
          </Button>
          
          <Flex gap="1" align="center">
            {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1)
              .map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "solid" : "soft"}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              ))}
          </Flex>
          
          <Button 
            variant="soft"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            下一页
          </Button>
        </Flex>
      )}
    </Flex>
  );
};