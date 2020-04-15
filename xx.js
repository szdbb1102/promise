const PENDING = "pending";
const FULLFILLED = "fulfilled";
const REJECTED = "rejected";

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError("Chaining cycle detected for promise"));
  }
  let called = false;
  if (x !== null && (typeof x === "object" || typeof x === "function")) {
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
class Promise {
  constructor(excutor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];
    let resolve = (val) => {
      if (this.state === PENDING) {
        this.value = val;
        this.state = FULLFILLED;
        this.onResolvedCallbacks.forEach((v) => v());
      }
    };
    let reject = (e) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = e;
        this.onRejectedCallbacks.forEach((v) => v());
      }
    };
    try {
      excutor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(onFullfilled, onRejected) {
    onFullfilled =
      typeof onFullfilled === "function" ? onFullfilled : (val) => val;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (error) => {
            throw error;
          };
    let promise2 = new Promise((resolve, reject) => {
      if (this.state === FULLFILLED) {
        setTimeout(() => {
          try {
            let x = onFullfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (this.state === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFullfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
  catch(fn) {
    return this.then(null, fn);
  }
}

//resolve方法
Promise.resolve = function (val) {
  return new Promise((resolve, reject) => {
    resolve(val);
  });
};
//reject方法
Promise.reject = function (val) {
  return new Promise((resolve, reject) => {
    reject(val);
  });
};
//race方法
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject);
    }
  });
};
//all方法(获取所有的promise，都执行then，把结果放到数组，一起返回)
Promise.all = function (promises) {
  let arr = [];
  let i = 0;
  function processData(index, data) {
    arr[index] = data;
    i++;
    if (i == promises.length) {
      resolve(arr);
    }
  }
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then((data) => {
        processData(i, data);
      }, reject);
    }
  });
};

// 执行测试用例需要用到的代码
Promise.deferred = function () {
  let defer = {};
  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};
console.log(module, module.exports, Promise);
module.exports = Promise;
