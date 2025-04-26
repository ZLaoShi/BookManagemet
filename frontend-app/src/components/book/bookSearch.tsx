import { useAtom } from 'jotai';
import { TextField, Button, Flex } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { searchInputAtom, finalSearchTermAtom } from '../../stores/bookAtoms';
import './bookSearch.scss';

export const BookSearch = () => {

  const [keyword, setKeyword] = useAtom(searchInputAtom);

  const [, setFinalSearchTerm] = useAtom(finalSearchTermAtom);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
  }

  const handleSearch = () => {
    setFinalSearchTerm(keyword.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Flex gap="3" align ="center" className="book-search">
      <TextField.Root 
        size="2"
        variant="surface" 
        radius="medium"
        className="search-input"
        placeholder="输入书名作者,作者名,ISBN或者出版社"
        value={keyword}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot> 
      </TextField.Root>
      <Button size="2" onClick={handleSearch}>
        搜索
      </Button>
    </Flex>
  );
};