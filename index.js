const PENDING = "pending";
const FULLFILLED = "pending";
const REJECTED = "rejected";

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  let called = false;
  if (x !== null && typeof x === "object") {
    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (e) => {
            if (called) return;
            called = true;
            reject(e);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}
class MyPromise {
  state = PENDING;
  fullfilledCB = [];
  rejectedCB = [];
  constructor(excutor) {
    let resolve = (val) => {
      if (this.state === PENDING) {
        this.value = val;
        this.state = FULLFILLED;
        this.fullfilledCB.forEach((v) => v());
      }
    };
    let reject = (e) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = e;
        this.rejectedCB.forEach((v) => v());
      }
    };
    try {
      excutor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(fullfilled, rejected) {
    fullfilled = typeof fullfilled === "function" ? fullfilled : (val) => val;
    rejected =
      typeof fullfilled === "function"
        ? rejected
        : (val) => {
            throw new Error(val);
          };
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.state === FULLFILLED) {
        let x = fullfilled(this.value);
        resolvePromise(promise2, x, resolve, reject);
      }
      if (this.state === REJECTED) {
        let x = reject(this.reason);
        resolvePromise(promise2, x, resolve, reject);
      }
      if (this.state === PENDING) {
        this.fullfilledCB.push(() => {
          let x = fullfilled(this.value);
          resolvePromise(promise2, x, resolve, reject);
        });
        this.rejectedCB.push(() => {
          let x = reject(this.reason);
          resolvePromise(promise2, x, resolve, reject);
        });
      }
    });
    return promise2;
  }
}
