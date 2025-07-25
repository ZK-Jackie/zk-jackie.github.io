---
title: "Python 进阶 —— asyncio"
meta_title: "Python asyncio、协程、异步编程"
description: "等待完善！"
date: 2025-01-25
image: ""
authors: ["Jackie"]
categories: ["编程语言"]
tags: ["Python"]
---

## 1 异步与协程

1. 引入

如何选取使用多线程还是协程？

```python
if io_bound:
    using asyncio
else:
    using multithread
```

2. 协程的创建

两种创建方法：

- 使用 asyncio.run 接口开启一段协程
- 使用 asyncio.get_event_loop 获取到当前已有的事件循环（队列），再使用 do_until 系列函数让协程进到循环（队列）中

3. 协程的运行

遇到 IO 任务时，会释放资源，交给事件循环中的其他任务进行，使用 await 关键字表示主动放弃**当前函数**的执行权，等待关键字后的任务完成并输出结果。

细品一下两种写法：

写法 1 ——  耗时 3s

```python
async def say_after(delay, content):
    await asyncio.sleep(delay)
    print(f"{content}")
    
async def main():
    await say_after(1, "hello")	
    await say_after(2, "world")
    
asyncio.run(main())
```

写法 2 —— 耗时2s

```python
async def say_after(delay, content):
    await asyncio.sleep(delay)
    print(f"{content}")
    
async def main():
    task1 = asyncio.create_task(
    	say_after(2, "world")
    )
    task2 = asyncio.create_task(
    	say_after(1, "hello")
    )
    await task1
    await task2
    
asyncio.run(main())
```

其中写法 1 就是很明显的无效协程，两个任务并没有同时被放入到事件循环里，main 将第一个任务放入后，就一直在等待第一个任务的结果

写法 2 使用 asyncio.create_task 将任务放进队列里面，随后依次等待完成，我们也可以直接使用一个 asyncio.gather，提供一个函数调用队列，他会一次性帮我们做好任务的创建和 await

综上，使用协程时，一定要注意 await 的使用！


## 2 异步编程

协程（Coroutine），也可以被称为微线程，是一种用户态内的上下文切换技术。简而言之，其实就是通过一个线程实现代码块相互切换执行，即用户态软件层面实现的“线程”，python 中的实现方式：

- greenlet
- yield  yield from关键字
- asyncio 装饰器
- async  await 关键字

后文只重点介绍async  await 关键字的相关内容

### 2.1 事件循环和协程函数

python 的异步编程中，内部维护着一个“事件循环”队列，即 Event loop。python 会逐一检测事件循环中的每个任务，随后依次执行可执行的任务。

#### 2.1.1 获取事件循环

```python
import asyncio

loop = asyncio.get_event_loop()
```

python 3.10 及以后，`asyncio.get_event_loop()` 如果在协程外部被调用，它将返回当前线程的事件循环；如果没有事件循环，它将创建一个新的事件循环。

`get_running_loop` 只会返回当前正在运行的事件循环。如果在协程外部调用 `get_running_loop`，通常会抛出 `RuntimeError`，因为此时没有事件循环在运行。

#### 2.1.2 插入任务到事件循环

```python
import asyncio

async def func():	# 协程函数
    pass

result = func()	# 协程对象

# 旧写法
loop = asyncio.get_event_loop()
loop.run_until_complete(result)

# 新写法，实际上两种写法是等价的  近些年来又开始推荐旧写法
asyncio.run(result)
```

### 2.2 协程函数与线程/进程池

#### 2.2.1 await 关键字

让出当前函数的执行权，不再往下执行，直至 await 后的函数执行完为止

#### 2.2.2 Task 对象

Task 对象是方便多个协程对象同时加入到事件循环的东西，可以有两种方式用于创建 Task：

- asyncio.create_task()
- loop.create_task() 和 loop.ensure_future()

```python
import asyncio

async def func():
    print(1)
    await asyncio.sleep(2)
    print(2)
    return "返回值"

async def main():
    print("main开始")
    task_list = [
        asyncio.create_task(func(), name="task1"),
        asyncio.create_task(func(), name="task2")
    ]
    print("main结束")
    done, pending = await asyncio.wait(task_list, timeout=None)
    # done是一个集合
    print(done, pending)

asyncio.run(main())
```

#### 2.2.3 asyncio.Future

Task 继承于 Future，Future 对象是可以被 “await” 的，类似于 JavaScript 中的 Promise

```python
import asyncio

async def set_after(fut):
    await asyncio.s1eep(2)
    fut.set_result("666")
    
async def main(）:
	# 获取当前事件环
    1oop = asyncio.get_running_loop()
    # 创建一个任务（Future对象），没绑定任何行为，则这个任务永远不知道什么时候结束。
    fut = loop.create_future()
    # 创建一个任务（Task对象），绑定了set_after函数，函数内部在2s之后，会给fut赋值。
    # 即手动设置future任务的最终结果，那么fut就可以结束了。
    await loop.create_task( set_after(fut) )
    # 等待Future对象获取最终结果，否则一直等下去
    data = await fut
    print(data)
               
asyncio.run( main() )
```

#### 2.2.4 concurrent.futures.Future

由于 “async” 的诅咒的存在，必须全线条都使用 asyncio 才能实现真正的协程，否则还是会因为某处过慢的 IO 操作而影响效率。这种情况下我们可结合进程/线程池使用。

python 中帮助了我们将二者结合使用的方法，类似于线程池转协程，如：

```python
import time
import asyncio
import concurrent.futures

def funcl():
    # 某个耗时操作
    time.s1eep(2)
    return "SB"

async def main():
    loop = asyncio.get_running_loop()
    # 1. Run in the default loop's executor（默认 ThreadPoolExecutor）
    # 第一步：内部会先调用 ThreadPoolExecutor 的 submit 方法去线程池中申请一个线程去执行funcl函数，并返回一个concurrent.futures.Future对象
    # 第二步：调用asyncio.wrap_future将concurrent.futures.Future对象包装为asycio.Future对象。
    # 因为concurrent.futures.Future对象不支持await语法，所以需要包装为asycio.Future对象才能使用。
    fut = loop.run_in_executor(None, func1)
    result = await fut
    print('default thread pool', result)
    # 2. Run in a custom thread pool:
    with concurrent.futures.ThreadPoolExecutor() as pool:
    	result = await loop.run_in_executor(pool, fut)
    	print('custom thread pool', result)
    # 3. Run in a custom process pool:
    with concurrent.futures.ProcessPoolExecutor() as pool:
    	result = await loop.run_in_executor(pool, func1)
    	print('custom process pool', result)
asyncio.run( main() )
```

### 2.3 上下文与可迭代对象

给类重写两个方法就能迭代类了，如：

```python
import asyncio
import random
from typing import Any

class AsyncIter:
    
    pool: Any
    
    def __atier__(self):
        return self
    
    async def __anext__(self):
        val = random.randInt()
        return val
    
    async def __aenter__(self):
        return self.pool.get_resource()
    
    async def __aexit__(self):
        return self.pool.release_resource()
    
    async def do_something(self):
        asyncio.sleep(2)
        return "something"
    
async def main():
    async_obj = AsyncIter()
    async for item in async_obj:
        print(item)
        
	async with async_obj as o:
        res = await o.do_something()
        print(res)
        
asyncio.run(main())
```

### 2.4 uvloop

是 asyncio 的事件循环的替代方案，效率会比传统的 asyncio 快很多。uvloop 事件循环>默认 asyncio 的事件循环。在项目中使用 uvloop：

```python
import asyncio
import uvloop
asyncio.set_event_loop_policy(uvloop.EventLooppolicy())
#编写asyncio的代码，与之前写的代码一致。
#内部的事件循环自动化会变为uv1oop
asyncio.run(...)
```

