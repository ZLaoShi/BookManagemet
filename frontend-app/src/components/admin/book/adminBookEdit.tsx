import { useMutation } from '@apollo/client';
import { 
  Dialog, 
  Flex, 
  Button, 
  TextField, 
  Text,
  TextArea
} from '@radix-ui/themes';
import { useState } from 'react';
import { Book } from '../../../types/book';
import { UPDATE_BOOK } from '../../../graphql/mutations/admin/book';
import { Message } from '../../../components/common/message';

interface AdminBookEditProps {
  book: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AdminBookEdit = ({ 
  book, 
  open, 
  onOpenChange,
  onSuccess 
}: AdminBookEditProps) => {
  const [formData, setFormData] = useState({
    isbn: book.isbn,
    title: book.title,
    author: book.author || '',
    publisher: book.publisher || '',
    publishDate: book.publishDate || '',
    category: book.category || '',
    description: book.description || '',
    totalCopies: book.totalCopies,
    availableCopies: book.availableCopies,
    location: book.location || ''
  });

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [updateBook, { loading }] = useMutation(UPDATE_BOOK, {
    onCompleted: () => {
      setIsSuccess(true);
      setMessageText('更新成功');
      setMessageOpen(true);
      onSuccess();
    },
    onError: (error) => {
      setIsSuccess(false);
      setMessageText(`更新失败: ${error.message}`);
      setMessageOpen(true);
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.isbn) newErrors.isbn = 'ISBN不能为空';
    if (!formData.title) newErrors.title = '书名不能为空';
    if (formData.totalCopies < 0) newErrors.totalCopies = '总数量不能小于0';
    if (formData.availableCopies < 0) newErrors.availableCopies = '可借数量不能小于0';
    if (formData.availableCopies > formData.totalCopies) {
      newErrors.availableCopies = '可借数量不能大于总数量';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await updateBook({
        variables: {
          id: book.id,
          input: {
            ...formData,
            totalCopies: Number(formData.totalCopies),
            availableCopies: Number(formData.availableCopies)
          }
        }
      });
    } catch (error) {
      // 错误已在 onError 中处理
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      <Message
        type={isSuccess ? 'success' : 'error'}
        message={messageText}
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
      />

      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content style={{ maxWidth: 600 }}>
          <Dialog.Title>编辑图书</Dialog.Title>
          
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  ISBN <span style={{ color: 'red' }}>*</span>
                </Text>
                <TextField.Root
                  value={formData.isbn}
                  onChange={(e) => handleChange('isbn', e.target.value)}
                  color={errors.isbn ? 'red' : undefined}
                />
                {errors.isbn && <Text size="1" color="red">{errors.isbn}</Text>}
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  书名 <span style={{ color: 'red' }}>*</span>
                </Text>
                <TextField.Root
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  color={errors.title ? 'red' : undefined}
                />
                {errors.title && <Text size="1" color="red">{errors.title}</Text>}
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  作者
                </Text>
                <TextField.Root
                  value={formData.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                />
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  出版社
                </Text>
                <TextField.Root
                  value={formData.publisher}
                  onChange={(e) => handleChange('publisher', e.target.value)}
                />
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  出版日期
                </Text>
                <TextField.Root
                  value={formData.publishDate}
                  onChange={(e) => handleChange('publishDate', e.target.value)}
                />
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  分类
                </Text>
                <TextField.Root
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                />
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  总数量
                </Text>
                <TextField.Root
                  type="number"
                  value={formData.totalCopies}
                  onChange={(e) => handleChange('totalCopies', parseInt(e.target.value) || 0)}
                  color={errors.totalCopies ? 'red' : undefined}
                />
                {errors.totalCopies && <Text size="1" color="red">{errors.totalCopies}</Text>}
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  可借数量(由后端自动计算)
                </Text>
                <TextField.Root
                  type="number"
                  value={formData.availableCopies}
                  onChange={(e) => handleChange('availableCopies', parseInt(e.target.value) || 0)}
                  color={errors.availableCopies ? 'red' : undefined}
                />
                {errors.availableCopies && <Text size="1" color="red">{errors.availableCopies}</Text>}
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  馆内位置
                </Text>
                <TextField.Root
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </Flex>

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="bold">
                  图书描述
                </Text>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </Flex>
              
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">取消</Button>
                </Dialog.Close>
                <Button type="submit" disabled={loading}>
                  {loading ? '保存中...' : '保存'}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};