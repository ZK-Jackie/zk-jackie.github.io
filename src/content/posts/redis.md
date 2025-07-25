---
title: "Redis 基础"
meta_title: "Redis 基础、Redis 数据结构、Redis CLI 操作、Redis SDK 操作"
description: "Redis 基础笔记，还有更深入的东西等待学习！"
date: 2025-01-25
image: ""
authors: ["Jackie"]
categories: ["编程语言"]
tags: ["缓存", "Redis"]
---

## 1 Redis 的数据结构

### 1.1 类型

| 基本类型  |          示例           |        CLI 操作命令         |
| :-------: | :---------------------: | :-------------------------: |
|  String   |         "Hello"         |  [操作](#122-string-操作)   |
|   Hash    | {name: "Jack", age: 21} |   [操作](#123-hash-操作)    |
|   List    |   [A -> B -> C -> C]    |   [操作](#124-list-操作)    |
|    Set    |        {A, B, C}        |    [操作](#125-set-操作)    |
| SortedSet |   {A: 1, B: 2, C: 3}    | [操作](#126-sortedset-操作) |

| 拓展类型 |         示例         | CLI 操作命令 |
| :------: | :------------------: | :----------: |
|   GEO    | {A: (123.45, 45.78)} |              |
|  BitMap  |   011100010111001    |              |
| HyperLog |   011100010111001    |              |

### 1.2 CLI 操作

#### 1.2.1 Keys 操作

- 查询

    - 列举符合要求的 key

  ```shell
  KEYS <pattern>
  ```

  pattern 可用符号 “\*” 作为通配符

    - 检查某一 key 是否存在

  ```shell
  EXSISTS <key>
  ```

  返回值为 1 或 0


- 删除

```shell
DEL <key> [more keys]
```

输入后，返回实际删除的 key 的数目

- 有效期

    - 设置 key 的有效期

  ```shell
  EXPIRE <key> <seconds>
  ```

    - 查看 key 的有效期

  ```shell
  TTL <key>
  ```

  返回值 > 1，表示 key 的剩余时间

  返回值 == -1，表示 key 永久不过期

  返回值 == -2，表示 key 已经失效

#### 1.2.2 String 操作

**类似**：Java 的 String

- 添加 / 修改

```shell
SET <key> <value>	# 添加/修改单个 KV 数据
MSET <k1> <v1> [<k2> <v2> ...]	# 批量添加/修改操作

SET <key> <value> NX # 添加/修改 KV 对，如果 K 不存在；成功返回 1，不成功返回 nil
SETNX <key> <value>	 # 同上条，成功返回 1，不成功返回 0

SET <key> <value> EX <seconds>	# 添加/修改 KV 对并设置有效期
SETEX <key> <value> <seconds>	# 同上条
```

- 获取

```shell
GET <key>
MGET <k1> [<k2> ...]
```

- 自增 / 自减

```shell
INCR <key>	# 让 key 对应的值自增 1
DECR <key>	# 让 key 对应的值自减 1

INCRBY <key> <step>			# 让这个 key 对应的值自增特定步长，取值范围为自然数
INCRBYFLOAT <key> <step>	# 让这个 key 对应的值自增特定步长，取值范围为任意浮点数
```

#### 1.2.3 Hash 操作

大致与上文一致，主要区别在于，确定一个 value 时，还需要一个 field 作为索引，命令名称开头均为 H；操作基本上都是对同一个 KEY
的多组 field-value 的操作；呈现出来的是一个 key 对应了一个两列的表格

**类似**：Java 的 HashMap

- 添加 / 修改

```shell
HSET <key> <field> <value> [field value ...]
# 自4.0起，HMSET 已弃用

HSETNX <key> <field> <value>

HSETEX <key> <value> <seconds>	# 同上条
```

- 查询

```shell
HGET <key> <field>	# 获取某一 field 的值
HMGET <k1> <field1> [k2 field2 ...]

HKEYS <key>	# 获取一个 key 中的所有 field
HVALS <KEY> # 获取一个 key 中的所有 field 的值
```

- 自增 / 自减

```shell
HINCR <key> <field>	# 让 key.field 的值自增 1

HINCRBY <key> <field> <step>
HINCRBYFLOAT <key> <field> <step>	# 让这个 key 对应的值自增特定步长，取值范围为任意浮点数
```

#### 1.2.4 List 操作

这个 List 指的是一种双向链表数据类型，支持**插入**、**弹出**、**范围查询**操作，呈现出来的是一个 key 中有一列元素

**类似**：Java 的 LinkedList

**特点**：可以用作链表、队列

**应用场景**：消息队列

- 插入

  ```shell
  LPUSH <key> <element1> [element2...] # 从左侧插入
  RPUSH <key> <element1> [element2...] # 从右侧插入
  ```

- 弹出

  ```shell
  LPOP <key> <number> # 从左侧依次弹出 number 个元素
  RPUSH <key> <number> # 从右侧依次弹出 number 个元素
  ```

- 范围查询

  ```shell
  LRANGE <key> <start> <number>	# 从左侧，start 开始（取值从 0 开始），列举 number 个元素
  ```

- 阻塞式弹出

  ```shell
  BLPOP <key> [timeout=0]	# 从左侧查询 key，如果查询到了则直接返回，查询不到则在 timeout 秒内一直查
  ```

#### 1.2.5 Set 操作

**类似**：Java 的 HashSet

**特点**：无序、数据唯一、查询快、支持交并差运算

- 插入

  ```shell
  SADD <key> <menber1> [member2 ...]
  ```

- 查询

  ```shell
  SMEMBERS <key>	# 查询 key 中拥有的 member
  SCARD <key>		# 清点 key 中有多少个元素
  SISMEMBER <key> <member>	# 查询 member 是否存在于 key 中
  ```

- 计算

  ```shell
  SINTER <key1> <key2> [key3...]	# 计算并返回交集
  SUNION <key1> <key2> [key3...]	# 计算并返回并集
  SDIFF <key1> <key2> [key3...]		# 计算并返回差集
  ```

#### 1.2.6 SortedSet 操作

**类似**：Java 的 TreeSet

**特点**：可排序、元素唯一、查询快

**应用场景**：排行榜

- 插入

  ```shell
  ZADD <key> [NX] <score> <member> [score member...]
  ```

- 删除

  ```shell
  ZREM <key> <member> [member...]	# 删除 key 中指定的 member
  ```


- 查询

  以下查询操作均支持 WITHSCORES 参数，用于返回分数；

  排序操作默认是从小到大排序的，若要从大到小排序，需要在命令 Z 后面加上 REV

  ```shell
  ZSCORE <key> <member>	# 查询 key 中指定 member 的分数
  ZRANK <key> <member>	# 查询 key 中指定 member 的排名
  
  ZCOUNT <key> <min> <max>	# 查询 key 中分数在 min 和 max 之间的元素个数
  ZRANGE <key> <start> <stop> [WITHSCORES]	# 按分数排名后，查询 key 中排名在 start 和 stop 之间的元素
  ZRANGEBYSCORE <key> <min> <max> [WITHSCORES]	# 按分数排名后，查询 key 中分数在 min 和 max 之间的元素
  
  ZCARD <key>	# 查询 key 中有多少个元素
  ```

- 修改

  ```shell
  ZINCRBY <key> <step> <member>	# 让 key 中指定 member 的分数增加 step
  ```

- 计算

  ```shell
  ZINTER <key1> <key2> [key3...]	# 计算并返回交集
  ZUNION <key1> <key2> [key3...]	# 计算并返回并集
  ZDIFF <key1> <key2> [key3...]		# 计算并返回差集
  
  ZINTERSTORE <dest> <key1> <key2> [key3...]	# 计算、存储并返回交集
  ZUNIONSTORE <dest> <key1> <key2> [key3...]	# 计算、存储并返回并集
  ZDIFFSTORE <dest> <key1> <key2> [key3...]		# 计算、存储并返回差集
  ```

## 2 SDK 操作

### 2.1 Java 操作

#### 2.1.1 Jedis

#### 2.1.2 Spring Data Redis

操作都是基于 RedisTemplate，可以使用 RedisTemplate 的 opsForXXX 方法获取对应的操作对象，再调用操作对象的 set、get
等方法进行操作。方法名的命名更对应 Java 对应数据结构的方法名。

RedisTemplate 对象在 Java Bean 中可以直接从 Spring 容器中获取，也可以通过注解 @Autowired 注入。

一般情况下，需要用自己的 RedisTemplate 对象，因为默认的 RedisTemplate 对象的序列化方式是
JdkSerializationRedisSerializer，不太适合存储字符串，总是会把字符串转为字节流再存储，取出来时也是字节流，不太方便。因此可以衍生出以下两种解决方案：

- 方案一：

自定义一个 RedisTemplate 对象，设置序列化方式为 GenericJackson2JsonRedisSerializer，然后用 `@Bean` 注解放到容器里面。

```java
@Bean
public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(redisConnectionFactory);
    Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
    template.setValueSerializer(serializer);
    template.setKeySerializer(new StringRedisSerializer());
    template.afterPropertiesSet();
    return template;
}
```

- 方案二：

统一使用 StringRedisTemplate，手动序列化和反序列化。

```java
@Autowired
private StringRedisTemplate stringRedisTemplate;

private static final ObjectMapper objectMapper = new ObjectMapper();

public void<T> set(String key, T value) {
    // 存
    try {
        stringRedisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(value));
    } catch (JsonProcessingException e) {
        e.printStackTrace();
    }
    // 取
    try {
        String json = stringRedisTemplate.opsForValue().get(key);
        if (json != null) {
            return objectMapper.readValue(json, T.class);
        }
    } catch (JsonProcessingException e) {
        e.printStackTrace();
    }
}
```

### 2.2 Python 操作

#### 2.2.1 redis-py

## 3 应用

命名要求：

项目: 业务: 数据类型: ID

### 3.1 缓存

略

### 3.2 消息队列

消息队列（MessageQueue），字面意思就是存放消息的队列。最简单的消息队列模型包括3个角色：

- 生产者（Producer）：送消息到消息队列
- 消费者（Consumer）：消息队列获取消息并处理消息
- 队列（Queue）：存储和管理消息，也被称为消息代理（MessageBroker）

RabbitMQ、Kafka、RocketMQ、ActiveMQ 等都是消息队列的实现，下文将讨论基于 Redis 的 List 结构、Pub/Sub 模式、Stream 结构的消息队列实现。

#### 3.2.1 List 结构消息队列

List 结构是一个双向链表，可以用来实现消息队列。生产者通过 LPUSH 命令将消息插入到队列的左侧，消费者通过 BRPOP
命令从队列的右侧阻塞获取消息。

```shell 生产者
LPUSH items item1 item2 item3
```

```shell 消费者
BRPOP items timeout=500
```

优点：

- 利用 Redis 的持久化特性，可以保证消息不会丢失
- 可满足简单的消息队列需求

缺点：

- 无法避免消息丢失（如消费者异常退出后，任务完成情况未知）
- 无法实现广播（消息只能被一个消费者消费）

#### 3.2.2 Pub/Sub 模式消息队列

Pub/Sub（发布订阅）是 Redis2.0 版本引入的消息传递模型。顾名思义，消费者可以订阅一个或多个channel，生产者
向对应channel发送消息后，所有订阅者都能收到相关消息。

常用命令：

- SUBSCRIBE channel [channel1 ...]：订阅一个或多个 channel
- UNSUBSCRIBE channel [channel1 ...]：取消订阅一个或多个 channel
- PUBLISH channel message：向 channel 发送消息
- PSUBSCRIBE pattern1 [pattern2]：订阅一个或多个符合 pattern 的 channel
- PUNSUBSCRIBE pattern1 [pattern1 pattern2 ...]：取消订阅一个或多个符合 pattern 的 channel

> Pattern 是一个通配符，可以用来表示多个 channel 名称。符号 `\*` 可以表示任意字符，符号 `?` 可以表示一个字符。
>
> 例如，订阅所有以 `news` 开头的 channel，可以使用 `PSUBSCRIBE news*` 命令；订阅以 `new` 开头，任意一个字符结尾的
> channel，可以使用 `PSUBSCRIBE new?` 命令。

优点：

- 可以实现广播，支持多生产者、多消费者

缺点：

- 无法保证消息不丢失（若消费者宕机，消息直接丢失）
- 不支持消息持久化
- 消息堆积有上限，不适合大量消息的场景（消息都堆在消费者处）

#### 3.2.3 Stream 结构消息队列

##### （1）单消费者模式

Stream 是 Redis5.0 版本引入的数据结构，能够实现功能完善的消息队列。Stream 用于存储时间序列数据。Stream
结构可以看作是一个消息队列，每个消息都有一个唯一的 ID，消息可以按照时间顺序存储。

- 发送消息

命令格式：

```shell
XADD <key> [NOMKSTREAM] [MAXLEN|MINID [=|~] threshold [LIMIT <count>]] *|ID field1 value1 [field2 value2 ...]
```

NOMKSTREAM：不创建 key，如果 key 不存在则报错

MAXLEN：限制 Stream 的长度，当 Stream 的长度超过 threshold 时，会自动删除旧消息

MINID：限制 Stream 的 ID，当 Stream 的 ID 超过 threshold 时，会自动删除旧消息

LIMIT：限制 Stream 的长度，当 Stream 的长度超过 count 时，会自动删除旧消息

\* | ID：使用自动生成 ID 或者自定义 ID

例如：

```shell
XADD mystream * name Jack age 21
```

- 读取消息

命令格式：

```shell
XREAD [COUNT <count>] [BLOCK <milliseconds>] STREAMS key [key ...] ID [ID ...]
```

COUNT：读取消息的数量为 count

BLOCK：阻塞时间为 milliseconds

STREAMS：读取/选择的 Stream 名称

ID：读取的起始 ID，可以使用 `0` 表示从第一条消息开始读取，`$` 表示从当前最新的消息开始读取

消息读完后，历史消息不会消失，消费者总是能够使用 `XREAD` 命令，令 ID 为 0，读取到 Stream 中所有的消息。

阻塞情况下，可以令 ID 为 `$`，等待最新的**一条消息**的到来。但是若有多条消息到来或曾经到来过，只能读取开始阻塞后的一条消息，有消息漏读的风险。

优点：

- 支持消息持久化，消息可回溯
- 一个消息可以被多个消费者消费
- 允许阻塞式读取消息

缺点：

- 有消息漏读的风险

##### （2）多消费者模式

消费者组（ConsumerGroup）：将多个消费者划分到一个组中，监听同一个队列。具备下列特点：

- 消息分流：消息只会被消费者组中的一个消费者消费
- 消息标示：每个消息都有一个唯一的 ID，消费者组会记录消费者消费到的最新消息 ID
- 消息确认：消费者获取信息后，消息处于 pending 状态，并存入一个 pending-list。消费者消费完消息后，需要向消费者组发送确认消息，消费者组会将消息从
  pending-list 中删除

###### 创建消费者组

命令格式：

```shell
XGROUP CREATE <key> <groupname> <ID|$> [MKSTREAM]
```

ID：消费者组的起始 ID，可以使用 `$` 表示从当前最新的消息开始消费

MKSTREAM：如果 key 队列不存在，则创建 key 队列

例如：

```shell
XGROUP CREATE mystream mygroup $  # 创建消费者组 mygroup，监听 mystream 队列，从当前最新的消息开始消费
```

###### 消费者从消费组消费消息

命令格式：

```shell
XREADGROUP GROUP <groupname> <consumername> [COUNT <count>] [BLOCK <milliseconds>] STREAMS key [key ...] ID [ID ...]
```

GROUP：消费者组名称

consumername：消费者名称

COUNT：读取消息的最大数量为 count

BLOCK：阻塞时间为 milliseconds

NOACK：获取消息后自动确认消息（不建议使用）

STREAMS：读取/选择的 Stream 队列名称

ID：读取的起始 ID，可以使用 `0` 表示从第一条消息开始读取，`>` 表示从消费者组中读取**尚未被消费的一条**消息

例如：

```shell
XREADGROUP GROUP mygroup consumer1 BLOCK 0 STREAMS mystream > # 消费者组 mygroup 中的 consumer1 消费者，不等待地从 mystream 队列中读取尚未被消费的一条消息
```

###### 消费者确认消息

命令格式：

```shell
XACK <key> <groupname> <ID> [ID ...]
```

例如：

```shell
XACK mystream mygroup 1600000000000-0 1600000000000-1  # 消费者组 mygroup 确认消费了 mystream 队列中的 0 号 和 1 号两条消息
```

正常情况下，消费者拿消息、消费者确认消息。但要是有消费者宕机，没有正常地完成消息，我们可以从 pending-list
中找到未确认的消息，重新分配给其他消费者。

###### 查看 pending-list

命令格式：

```shell
XPENDING <key> <groupname> [[IDLE min-idle-time] <start> <end> <count> [consumer]]
```

IDLE：消费者拿了消息后，min-idle-time 时间内没有确认消息

start：想获取的最小的 ID，若为 `-`，表示最小的 ID

end：想获取的最大的 ID，若为 `+`，表示最大的 ID

count：想获取的消息数量

consumer：想获取的消费者名称

例如：

```shell
XPENDING mystream mygroup - + 10  # 查看消费者组 mygroup 中的 pending-list，获取 10 条消息
```

优点：

- 支持消息持久化，消息可回溯
- 一个消息可以被多个消费者消费
- 允许阻塞式读取消息
- 实现了消息确认机制，保证消息不会丢失、漏读

#### 3.2.4 消息队列对比

|              |                   List                   |       PubSub       |                         Stream                         |
| :----------: | :--------------------------------------: | :----------------: | :----------------------------------------------------: |
|  消息持久化  |                   支持                   |       不支持       |                          支持                          |
|   阻塞读取   |                   支持                   |        支持        |                          支持                          |
| 消息队列堆积 | 受限于内存空间，可以利用多消费者加快处理 | 受限于消费者缓冲区 | 受限于队列长度，可以利用消费者组提高消费速度，减少堆积 |
| 消息确认机制 |                  不支持                  |       不支持       |                          支持                          |
|   消费回溯   |                  不支持                  |       不支持       |                          支持                          |

### 3.3 分布式锁