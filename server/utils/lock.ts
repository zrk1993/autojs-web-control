/**
 * Lock Tool
 * kun
 * 2019-10-25
 */

const LOCKS: {
  [type: string]: {
    curLock: Lock;
    lockAt: number;
    queue: PromiseWrap[];
  };
} = {};

export function getLock(type: string) {
  const pw = new PromiseWrap();
  if (!LOCKS[type]) {
    LOCKS[type] = { curLock: null, lockAt: null, queue: [] };
  }
  LOCKS[type].queue.push(pw);
  process.nextTick(() => {
    loop(type);
  });
  return pw.promise;
}

function loop(type: string) {
  if (!LOCKS[type]) return;
  if (LOCKS[type].curLock) {
    if (LOCKS[type].lockAt + 12 * 1000 < Date.now()) {
      LOCKS[type].curLock.release();
      console.error(`Lock ${type} Timeout Released`);
    }
    return;
  }

  const p = LOCKS[type].queue.shift();
  if (!p) return;

  const lock = new Lock(type);
  LOCKS[type].curLock = lock;
  LOCKS[type].lockAt = Date.now();
  p.resolve(lock);
}

function release(type: string) {
  LOCKS[type].curLock = null;
  LOCKS[type].lockAt = null;
  if (LOCKS[type].queue.length === 0) {
    delete LOCKS[type];
    return;
  }
  loop(type);
}

class PromiseWrap{
  promise: Promise<Lock>;
  resolve: (v?: any) => void;
  reject: (v?: any) => void;
  constructor() {
    this.promise = new Promise<Lock>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class Lock {
  type: string;
  isReleased: boolean;
  constructor(type: string) {
    this.type = type;
    this.isReleased = false;
  }

  release() {
    if (this.isReleased) return;
    release(this.type);
  }
}
