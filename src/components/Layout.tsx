import { Outlet, useLocation } from 'react-router-dom';
import BottomTabBar from './BottomTabBar';

export const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 用 key 强制 React 在路由变化时重置 Outlet 内部状态（但不做卸载动画，避免白屏） */}
      <div key={location.pathname} className="animate-in fade-in duration-200">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
};
