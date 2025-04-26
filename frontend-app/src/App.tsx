import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function App() {
  return (
   
      <RouterProvider router={router} />

  );
}

export default App;

//TODO 搞清楚项目结构
//基本确定要封装的组件
//组合页面,渲染数据
