---
title: "Neo4j 图数据库学习 & 实战记录"
meta_title: "Neo4j 基本语法、Python 连接、数据备份与恢复"
description: "Neo4j 初学笔记，只涉及基础语法和与 Python 连接的部分，文中使用的是 py2neo，但无论是个人日常使用还是社区似乎都多用 Neo4j 官方提供的库，后续会更新更多使用教程、neo4j 与 Spring Data、neo4j 与 LLM 应用的结合等方面的内容。"
date: 2023-11-15
image: ""
authors: ["Jackie"]
categories: ["Web 开发"]
tags: ["图数据库", "Neo4j"]
---

## Neo4j



### CH0 学习参考资料

[Neo4j和知识图谱：从基础入门到精通全栈教程](https://www.bilibili.com/video/BV1MR4y1L7zG)



### CH1 前言

neo4j启动：bin目录下cmd输入neo4j console



### CH2 语法及命令

#### 1 Cypher 语句

- Neo4j图形数据库查询语言
- 声明性模式匹配语言
- 遵循SQL语法

<table>
    <tr>
    	<th>Cypher命令</th>
        <th>用法</th>
    </tr>
    <tr>
    	<td>CREATE</td>
        <td>创建节点、关系、属性</td>
    </tr>
    <tr>
    	<td>MATCH</td>
        <td>查询节点、关系、属性</td>
    </tr>
    <tr>
    	<td>RETURN</td>
        <td>返回查询结果</td>
    </tr>
    <tr>
    	<td>WHERE</td>
        <td>条件查询</td>
    </tr>
    <tr>
    	<td>DELETE</td>
        <td>删除节点、关系</td>
    </tr>
    <tr>
    	<td>REMOVE</td>
        <td>移除节点、关系的属性</td>
    </tr>
    <tr>
    	<td>ORDER BY</td>
        <td>排序</td>
    </tr>
    <tr>
    	<td>SET</td>
        <td>添加、更新数据</td>
    </tr>
</table>





###### （1）CREATE

创建节点、关系、属性，例如

```cypher
/*创建单一节点*/
CREATE (变量)
/*创建多节点*/
CREATE (变量1),(变量2)
/*创建带标签的节点*/
CREATE (n:类1:类2)
/*创建带属性的节点*/
CREATE (n:类名 {属性名:"字符串", 属性名:数字})
/*创建关系*/
CREATE (Entity1)<-[:Relation]-(Entity2)-[:Relation]->(Entity3)	/*可以直接打，也可先查询后用变量创建*/
```




###### （2）MATCH

查询关系，例如

```cypher
/*查询全部*/
MATCH (N:类) RETURN N
/*查询匹配的关系*/
MATCH p=()-[:类]->() RETURN p
/*查询一节点和一节点的关系*/
MATCH (:类 {属性})-[r]->(:类 {属性})
	RETURN type(r)
/*查询一节点和其他节点的全部关系*/
MATCH (:类 {属性})-[r]->()
	RETURN type(r)
```



###### （3）DELETE

删除节点，例如

```cypher
/*删除某标签下的所有节点*/
MATCH (n:标签)
	DELETE n
/*删除所有节点*/
MATCH (n)
	DELETE n
/*删除两节点间的关系*/
MATCH (:类 {属性})-[r]->(:类 {属性})
	DELETE r
/*删除一节点和其他节点的所有关系*/
MATCH (:类 {属性})-[r]->()
	DELETE r
```



###### （4）SET

添加、更新某一属性，例如

```cypher
/*添加、更新某一属性*/
MATCH(n:类) WHERE a.属性=属性值
	SET a.属性=属性值	/*若有则更新，若无添加*/
	RETURN a
```



###### （5）REMOVE

删除某一属性，例如

```cypher
/*删除某一属性*/
MATCH(n:类) WHERE a.属性=属性值
	REMOVE a.属性=属性值	/*删除a的一个属性*/
	RETURN a
```



###### （6）ORDER BY



#### 2  Neo4j 与 python

##### 2.1 相关包

```python
from py2neo import Graph
from py2neofun import CreateNode
```

##### 2.2 连接与使用

```python
# 连接数据库
g = Graph('http://localhost:7474/', username='neo4j', password='12345678')
# 执行cypher
graph.run('cypher命令')
# 获取cypher return结果
graph.run('cypher命令').data()
```



#### 3 Neo4j与Linux

##### 3.1 前置准备工作

###### （1）准备Linux工具

安装JDK并设置环境变量

libasound2

neo4j并修改相关配置

###### （2）准备windows工具

Putty 或 Xshell：Telnet、ssh和rlogin客户端（win10及以上可用powershell）

WinSCP：远程ssh文件传输工具（win10及以上可用powershell）

#### 4 拓展资料

- [中文开放知识图谱网](http://openkg.cn/datasets-type/)
- [关系抽取公开数据集整理合集 - zhihu](https://zhuanlan.zhihu.com/p/581554247)
- [rdf转换器 - github](https://github.com/jievince/rdf-converter?tab=readme-ov-file)
- [使用 LLM，将任何文本语料库转化为知识图谱 - zhihu](https://zhuanlan.zhihu.com/p/672098386)
- [LLM+KG示例项目](https://github.com/mcks2000/llm_notebooks/blob/main/ollama_knowlage_graph/helpers/prompts.py)

#### 5 数据集附录

- [NLP Knowledge Graph Data(Excel) - kaggle](https://www.kaggle.com/datasets/vishnunkumar/nlp-knowledge-graph-data)
-




```
"\"You are a network graph maker who extracts terms and their relations from a given context. " \
"You are provided with a context chunk (delimited by ```) Your task is to extract the ontology " \
"of terms mentioned in the given context. These terms should represent the key concepts as per the context. \\\\n" \
"Thought 1: While traversing through each sentence, Think about the key terms mentioned in it.\\\\n" \
"\\\\tTerms may include object, entity, location, organization, person, \\\\n" \
"\\\\tcondition, acronym, documents, service, concept, etc.\\\\n" \
"\\\\tTerms should be as atomistic as possible\\\\n\\\\n" \
"Thought 2: Think about how these terms can have one on one relation with other terms.\\\\n" \
"\\\\tTerms that are mentioned in the same sentence or the same paragraph are typically related to each other.\\\\n" \
"\\\\tTerms can be related to many other terms\\\\n\\\\n" \
"Thought 3: Find out the relation between each such related pair of terms. \\\\n\\\\n" \
"Format your output as a list of JSON. Each element of the list contains a pair of terms" \
"and the relation between them, like the following: \\\\n" \
"[\\\\n" \
"   {\\\\n" \
'       "node_1": "A concept from extracted ontology",\\\\n' \
'       "node_2": "A related concept from extracted ontology",\\\\n' \
'       "edge": "relationship between the two concepts, node_1 and node_2 in one or two sentences"\\\\n' \
"   }, {...}\\\\n" \
"]\""
```



### CH3 数据备份

命令区别可见网页中部的表格对比：[Backup and restore planning - Operations Manual](https://neo4j.com/docs/operations-manual/current/backup-restore/planning/)

#### 1 使用 dump/load命令

命令特点：

- 任何版本都可用
- 可以运用于在线或离线 DBMS
- 载入数据无法同步到在线数据库上，必须重启数据库
- 不可以远程执行，必须使用本地的 neo4j-admin

##### 数据导出

```shell
.\neo4j-admin database dump [-h] [--expand-commands] [--verbose] [--overwrite-destination[=true|false]] [--additional-config=<file>] [--to-path=<path> | --to-stdout] <database>
```

##### 数据导入

```shell
.\neo4j-admin database load [-h] [--expand-commands] [--info] [--verbose] [--overwrite-destination[=true|false]] [--additional-config=<file>] [--from-path=<path> | --from-stdin] <database>
```

常用：

```shell
neo4j-admin database load --overwrite-destination=true --from-path=/backup DB6E9
```

:exclamation:

#### 2 使用 backup/restore 命令

命令特点：

- 仅企业版
- 仅可以运用于在线 DBMS
- 可以同步到在线数据库上
- `restore`可以运用于离线数据库
- `backup`可以远程运行
- :warning:会占用大量服务器资源，建议在一台特殊的机器上运行

##### [数据导出](https://neo4j.com/docs/operations-manual/current/backup-restore/online-backup/#backup-command-syntax)

- 本地命令备份

1. from参数：逗号分隔的 Neo4j 实例的主机和端口列表，每个实例按顺序尝试。
2. temp-path：用于备份工作的临时工作路径，工作结束后会自动删干净
3. to-path：备份存放目录，必填，可以使用适当的 URI 作为路径，将数据库备份到 AWS S3 存储桶、Google Cloud 存储桶和 Azure。

```shell
neo4j-admin database backup [--from=<host:port>[,<host:port>…]] [--temp-path=<path>] [--to-path=<path>] <database>
```

- 远程命令备份



##### [数据导入](https://neo4j.com/docs/operations-manual/current/backup-restore/restore-backup/)

```shell
neo4j-admin database restore [--overwrite-destination[=true|false]] [--temp-path=<path>] --from-path=<path> [<database>]
```



### 高级特性

#### 1. token检索（官方叫Full-text）

##### 步骤1：构建Full-text索引

- 对于结点：选取想要被token检索的类和字段，随后输入以下代码构建索引

```cypher
//语法
CREATE FULLTEXT INDEX <index_name> FOR (<var_name>:<class1>|<class2>|...|<classn>) ON EACH [<var_name>.<classes_properties1>, <var_name>.<classes_properties1>]

// 例子
CREATE FULLTEXT INDEX namesAndTeams FOR (n:Employee|Manager) ON EACH [n.name, n.team]

CREATE FULLTEXT INDEX communications FOR ()-[r:REVIEWED|EMAILED]-() ON EACH [r.message]
```

可以一次性选多个结点、多个结点的属性（可以是节点间共有的属性、可以是不共有的，但是都可以用同一个变量去指向），然后可以针对这些结点的属性构建这样一个Full-text索引。Full-text索引的名字比较关键，后文都要基于这个名字展开应用。注意，中括号必须加。

- 对于边：与结点类似，略

##### 步骤2：使用Full-text索引展开检索

```cypher
//查询点
CALL db.index.fulltext.queryNodes("namesAndTeams", "nils") YIELD node, score
RETURN node.name, score

//查询关系
CALL db.index.fulltext.queryRelationships("communications", "meeting") YIELD relationship, score
RETURN type(relationship), relationship.message, score
```

通过调用fullindex函数，可以获得查询到的所有对象和每个对象的得分。从个人理解上看，这个得分是指结果与搜寻内容的相似程度。

#### 2. 向量检索

##### 步骤1：自己把每个结点信息向量化

针对于每一个结点，制作一个他们自己的embeddings，里面放其他属性组织起来的，用向量模型转成的向量

##### 步骤2：把向量化信息插入到数据库中

在数据库中定位到该结点，使用`db.create.setNodeVectorProperty`函数为结点添加向量信息，代码如下：

```cypher
MATCH (m:Movie {title: movie.title, plot: movie.plot})
    CALL db.create.setNodeVectorProperty(m, 'embedding', movie.embedding)
```

##### 步骤3：构建向量索引

```cypher
CREATE VECTOR INDEX moviePlots
FOR (m:Movie)
ON m.embedding
OPTIONS {indexConfig: {
    `vector.dimensions`: 384,
    `vector.similarity_function`: 'cosine'
}}
```

值得注意的是，5.23及以后版本，OPTIONS内的内容不一定要给，

##### 步骤4：使用向量索引检索

```cypher
CALL db.index.vector.queryNodes('moviePlots', 5, <用户提供的关键词的embeddings>)
YIELD node AS movie, score
RETURN movie.title AS title, movie.plot AS plot, score
```

##### 查看现有索引

```cypher
SHOW VECTOR INDEXES
```

##### 删除索引

```cypher
DROP INDEX nodeNameVectorIndex
```
