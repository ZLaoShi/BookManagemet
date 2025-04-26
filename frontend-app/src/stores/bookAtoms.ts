import { atom  } from "jotai";

// 保存搜索输入框中实时输入的值的 atom
export const searchInputAtom = atom('');

// 保存最终用于触发查询的搜索词的 atom
// 只有在用户明确执行搜索操作时才会更新（例如点击按钮或按下回车键）
export const finalSearchTermAtom = atom('');