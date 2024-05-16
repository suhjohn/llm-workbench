export class Semaphore {
  private tasks: (() => Promise<any>)[] = [];
  private count: number;

  constructor(public concurrency: number) {
    this.count = concurrency; // Maximum number of concurrent tasks allowed
  }

  private sched() {
    if (this.count > 0 && this.tasks.length > 0) {
      this.count--;
      const task = this.tasks.shift()!;
      task().finally(() => {
        this.count++;
        this.sched();
      });
    }
  }

  public async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.tasks.push(() => task().then(resolve, reject));
      process.nextTick(() => this.sched());
    });
  }
}
