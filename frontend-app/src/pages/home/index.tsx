import { useState, useEffect } from 'react'; 
import { useQuery } from '@apollo/client';
import { useAtom } from 'jotai'; 
import { GET_BOOKS } from '../../graphql/queries/books'; 
import { SEARCH_BOOKS } from '../../graphql/queries/searchBook';
import { finalSearchTermAtom } from '../../stores/bookAtoms'; 
import { Book } from '../../types/book';
import './index.scss';
import { BookList } from '../../components/book/bookList';
import { BookSearch } from '../../components/book/bookSearch';
import { Flex } from '@radix-ui/themes';

// 定义两个查询中预期数据结构的接口
interface PageInfo {
  totalPages: number;
  hasNext: boolean;
}

interface BooksData {
  content: Book[];
  pageInfo: PageInfo;
}

export const HomePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [finalSearchTerm] = useAtom(finalSearchTermAtom); // 从 Jotai 中读取最终搜索关键词

  // --- 用于记录上一次的搜索词状态，以便判断是否需要重置页码 ---
  // 我们需要知道搜索词的“有无”是否发生了变化（是否添加或移除）

  const [prevSearchTerm, setPrevSearchTerm] = useState(finalSearchTerm);

  // --- 判断当前使用哪个查询和变量 ---
  const isSearching = Boolean(finalSearchTerm); // 如果有搜索词就是在搜索状态
  const activeQuery = isSearching ? SEARCH_BOOKS : GET_BOOKS;

  // 定义基础变量，根据情况加入关键词
  const queryVariables: { page: number; size: number; keyword?: string } = {
    page: currentPage,
    size: 10, 
  };
  if (isSearching) {
    queryVariables.keyword = finalSearchTerm;
  }

  // --- 执行 Apollo 查询 ---
  // 这里为了简单使用 any 类型，需要小心访问响应数据
  // 更安全的方式是使用类型联合并添加类型保护
  const { loading, error, data, refetch } = useQuery<any>(activeQuery, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network', // 对于可能会刷新或被搜索的列表来说，这通常是个不错的策略
    notifyOnNetworkStatusChange: true, // 若希望更精细地控制 loading 状态则很有用
  });

  // --- 当搜索词被添加或移除时，重置页码 ---
  useEffect(() => {
    // 检查搜索词的“有无状态”是否发生了变化
    const searchTermPresenceChanged = Boolean(prevSearchTerm) !== Boolean(finalSearchTerm);

    if (searchTermPresenceChanged) {
      console.log("搜索状态发生变化，重置页码为 1，新关键词：", finalSearchTerm);
      setCurrentPage(1);
      // 在重置页码后更新前一个搜索词的状态
      setPrevSearchTerm(finalSearchTerm);

      // 可选：如有必要也可以显式 refetch，不过 Apollo 在变量变更时会自动重新请求
      // 建议先测试自动行为是否满足需求再考虑手动
      // refetch({ ...queryVariables, page: 1, keyword: finalSearchTerm || undefined });
    }
    // 如果只是页码改变（如分页组件触发），则不应该重置
  }, [finalSearchTerm, prevSearchTerm, refetch, queryVariables]); // 当这些依赖变化时重新执行 effect

  // --- 根据是否在搜索中提取数据 ---
  // 使用可选链避免空数据错误
  const responseData = isSearching ? data?.searchBooks : data?.books;
  const books: Book[] = responseData?.content || [];
  const totalPages = responseData?.pageInfo?.totalPages || 1;

  // --- 渲染逻辑 ---
  // 显示加载中状态（也可以选择在加载时保留旧数据）
  if (loading && !responseData?.content) return <div>加载中...</div>; // 正在加载且无数据时显示
  if (error) return <div>错误: {error.message}</div>;

  // 处理搜索结果为空的情况（可选：显示提示信息）
  const noResultsFound = isSearching && !loading && books.length === 0;

  return (
    <div className="home-container">
      {/* 页面标题，可根据搜索状态调整 */}
      <h1 className="page-title">{isSearching ? `搜索 "${finalSearchTerm}" 结果` : '图书列表'}</h1>

      {/* 渲染搜索组件 - 不再需要通过 props 传递搜索逻辑 */}
      <Flex justify="center" mb="4">
        <BookSearch />
      </Flex>

      {/* 如果搜索无结果则显示提示信息 */}
      {noResultsFound && <div style={{ marginTop: '1rem', textAlign: 'center' }}>找不到与 "{finalSearchTerm}" 相关的图书。</div>}

      {/* 渲染图书列表，使用过滤后的数据或默认数据 */}
      {/* 只在搜索非空或存在结果时渲染列表 */}
      {(!noResultsFound) && (
        <BookList
          books={books}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage} // 传入分页组件使用的页码设置函数
        />
      )}
    </div>
  );
};
