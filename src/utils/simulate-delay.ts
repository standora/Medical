/**
 * 模拟网络延迟，用于 Mock 数据加载状态测试
 * @param ms 延迟毫秒数，默认 600-1200ms 随机
 */
export function simulateDelay(ms?: number): Promise<void> {
  const delay = ms ?? (600 + Math.random() * 600);
  return new Promise((resolve) => setTimeout(resolve, delay));
}
