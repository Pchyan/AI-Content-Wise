import { useEffect } from 'react';

/**
 * 自定義 Hook - 用於抑制特定警告訊息
 */
export const useSuppressWarnings = () => {
  useEffect(() => {
    // 保存原始 console.warn 方法
    const originalWarn = console.warn;

    // 修改 console.warn，過濾掉 React Router 的警告
    console.warn = (...args) => {
      // 檢查是否為 React Router 相關警告
      if (
        args.length > 0 &&
        typeof args[0] === 'string' &&
        (args[0].includes('React Router') || 
         args[0].includes('DEPRECATED') ||
         args[0].includes('future flag'))
      ) {
        // 不顯示這些警告
        return;
      }

      // 其他警告正常顯示
      originalWarn(...args);
    };

    // 清理函數
    return () => {
      console.warn = originalWarn;
    };
  }, []);
};

export default useSuppressWarnings; 