class myPromise {
    constructor(executor) {
        // 初始化值
        this.initValue()
        // 初始化绑定this
        this.initBinding()
        try {
            executor( this.resolve, this.reject)
        }catch (e) {
            this.reject('error')
        }

    }
    initValue() {
        this.PromiseState = 'pending'
        this.PromiseResult = null
        // 保存成功/失败回调
        this.onFulfilledCallbacks = []
        this.onRejectedCallbacks = []
    }
    initBinding() {
        this.resolve = this.resolve.bind(this)
        this.reject = this.reject.bind(this)
    }
    resolve(value) {
        if (this.PromiseState !== 'pending')  return
        this.PromiseState = 'fulfilled'
        this.PromiseResult = value
        // 执行保存的成功回调
        while (this.onFulfilledCallbacks.length) {
            this.onFulfilledCallbacks.shift()(this.PromiseResult)
        }
    }
    reject(reason) {
        if (this.PromiseState !== 'pending')  return
        this.PromiseState = 'rejected'
        this.PromiseResult = reason
        while (this.onRejectedCallbacks.length) {
            this.onRejectedCallbacks.shift()(this.PromiseResult)
        }
    }
    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        // 链式调用
        var thenPromise = new myPromise((resolve, reject) => {
            const resolvePromise = (cb) => {
                // 使用try catch 捕获异常
                setTimeout(() => {
                    try {
                        const x = cb(this.PromiseResult)
                        if (x === thenPromise && x)  {
                            throw new Error('不能返回自身....')
                        }
                        if (x  instanceof myPromise)  {
                            x.then(resolve,reject)
                        }else {
                            resolve(x)
                        }

                    } catch (err) {
                        reject(err)
                        throw new Error(err)
                    }
                })
            }
            if (this.PromiseState === 'fulfilled')  {
                // 如果当前是成功，执行第一个回调
                resolvePromise(onFulfilled)
            }else if (this.PromiseState === 'rejected')  {
                // 如果当前是失败，执行第一个回调
                resolvePromise(onRejected)
            }else if (this.PromiseState === 'pending')  {
                this.onFulfilledCallbacks.push(onFulfilled.bind(this))
                this.onRejectedCallbacks.push(onRejected.bind(this))
            }
        })
         return  thenPromise
    }


    static all(promises) {
        const result = []
        let count = 0
        return new myPromise((resolve, reject) => {
            const addData = (index, value) => {
                result[index] = value
                count++;
                if (count === promises.length) resolve(result)
            }
            promises.forEach((promise,index) => {
                if (promise instanceof  myPromise) {
                    promise.then(res=> {
                        addData(index,res)
                    },err => reject(err))
                }else  {
                    addData(index, promise)
                }
            })
        })
    }

    static race(promises) {
     return new myPromise((resolve, reject) => {
         promises.forEach((promise) => {
             if (promise instanceof myPromise) {
                 promise.then(res=>{
                     resolve(res)
                 },err => {
                     reject(err)
                 })
             }else {
                 resolve(promise)
             }
         })
     })
    }

    static allSettled(promises) {
        return new myPromise((resolve, reject) => {
            const result = []
            let count = 0
            const addData = (status, value, i) => {
                result[i] = {
                    status,
                    value
                }
                count++
                if (count === promises.length) {
                    resolve(result)
                }
            }
            promises.forEach((promise,i) => {
                if (promise instanceof myPromise) {
                    promise.then(res=> {
                        addData('fulfilled',res,i)
                    },err => {
                        addData('rejected',err,i)
                    })
                }else {
                    addData('fulfilled',promise,i)
                }
            })
        })
    }
    static any(promises) {
        return new myPromise((resolve, reject) => {
            let count = 0
            promises.forEach((promise) => {
                promise.then(val => {
                    resolve(val)
                })
            },err => {
                count++
                console.log(count)
                if (count === promises.length) {
                    reject(new AggregateError('All promises were rejected'))
                }
            })
        })
    }
}


// const test1 = new myPromise((resolve, reject) => {
//     resolve('success')
// })
// console.log(test1)
//
// /*
// * myPromise {
//   PromiseState: 'fulfilled',
//   PromiseResult: 'success',
//   resolve: [Function: bound resolve],
//   reject: [Function: bound reject]
// }
// * */
// const test2 = new myPromise((resolve, reject) => {
//     reject('error')
// })
// console.log(test2)
/*
*myPromise {
  PromiseState: 'rejected',
  PromiseResult: 'error',
  resolve: [Function: bound resolve],
  reject: [Function: bound reject]
}
 */

// const test3 = new myPromise((resolve, reject) => {
//     reject('error')
//     resolve('success')
// })
// console.log(test3)
//
//
// const test4 = new myPromise((resolve, reject) => {
//     resolve('100')
// }).then(res => console.log(res), err => console.log(err))
// console.log(test4)


// const test3 = new myPromise((resolve, reject) => {
//     resolve(100) // 输出 状态：success 值： 200
// }).then(res => 2 * res, err => 3 * err)
//     .then(res => console.log('success', res), err => console.log('fail', err))
// // console.log(test3)
// const test4 = new myPromise((resolve, reject) => {
//     resolve(100) // 输出 状态：fail 值：200
// }).then(res => new myPromise((resolve, reject) => reject(2 * res)), err => new Promise((resolve, reject) => resolve(3 * err)))
//     .then(res => console.log('success', res), err => console.log('fail', err))
// console.log(test4)


// const test5 = new myPromise((resolve, reject) => {
//     resolve(1)
// }).then(res => console.log(res), err => console.log(err))
//
// console.log(2)

const test1 = new myPromise((resolve, reject) => {
    reject(100)
})
const test2 = new myPromise((resolve, reject) => {
    reject('hahahahha')
})
// myPromise.all([test1, test2,300]).then(result => {console.log(result)})
// myPromise.race([test1, test2]).then(result => {console.log(result)})
// myPromise.allSettled([test1, test2]).then(result => {console.log(result)})
myPromise.any([test1, test2]).then(result => {console.log(result)},err=>{console.log(err)})