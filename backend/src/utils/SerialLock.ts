/**
 * 进程内串行锁：审批、完成步骤等"先到者生效"动作必须在锁内执行条件迁移，
 * 避免两个并发请求同时读到旧状态而都成功。
 */
type Task<T> = () => Promise<T>;

export class SerialLock {
  private tail: Promise<unknown> = Promise.resolve();

  async run<T>(task: Task<T>): Promise<T> {
    const previous = this.tail;
    let release: () => void;
    this.tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await task();
    } finally {
      release!();
    }
  }
}

export const writeLock = new SerialLock();
