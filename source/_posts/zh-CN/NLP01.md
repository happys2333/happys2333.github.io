---
title: 自然语言处理
date: 2022-10-06
updated: 2026-09-15
tags: [NLP, Machine-Learning]
categories: [Machine-Learning]
language: zh-CN
description: 从 NLP 的任务与文本表示出发，用一个最小分类实验理解训练、预测与评估。
---

[Read in English](/2022/09/08/en/NLP01/)

自然语言处理（NLP）研究怎样让计算机处理人类语言。这里不从复杂模型开始，而是沿着“任务 → 数据 → 表示 → 模型 → 评估”走一遍，把第一条可运行的流程搭起来。

> 原文发表于 2022 年；本次正文于 2026 年 9 月补全。下方数据为自拟教学样本，不用于证明任何模型的真实性能。

<!-- more -->

## 1. 先定义任务，而不是先选模型

同样输入一段文字，不同任务需要的输出并不相同。

| 任务 | 输入 | 输出 |
| --- | --- | --- |
| 文本分类 | 一条评价 | 正向 / 负向等类别 |
| 序列标注 | 一段新闻 | 人名、地点、机构的位置与类型 |
| 检索 | 一个问题 | 与问题相关的文档 |
| 文本生成 | 问题与上下文 | 一段回答、摘要或翻译 |

例如“这家店服务不错，但是等了很久”，整体情绪不一定能用一个简单标签完整描述。先说明标签定义、使用场景与允许的错误，再考虑是否需要更复杂的模型。

## 2. 文本如何变成数字

计算机模型通常不能直接把字符串当作数值特征。常见做法可以分成三层。

**词袋与 TF-IDF**：统计文本中出现了哪些词或片段。TF-IDF 在词频之外考虑一个词在语料中是否普遍出现，降低到处都有的词所占的权重。它简单、可解释，适合先建立基线。[scikit-learn 文本特征文档](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction)提供了具体定义。

**词向量**：用稠密向量表示词或 token。静态词向量中，一个词通常对应固定表示，不能充分表达同一个词在不同语境下的变化。

**上下文表示**：表示会随着上下文改变。Transformer 是构建这类表示的重要架构，但并不意味着所有文本任务都必须从 Transformer 开始。

token 也不总等于一个完整单词。对中文可以使用分词，也可以直接使用字符片段。下面为了降低依赖，使用字符级 n-gram；它只是一种演示选择，不代表对所有中文任务都最优。

## 3. 一个最小的中文情感分类实验

先在项目虚拟环境中安装 `scikit-learn`：

```bash
python -m pip install scikit-learn
```

将以下代码保存为 `nlp_demo.py`，然后运行 `python nlp_demo.py`：

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

texts = [
    "这次服务很好", "产品质量很好", "使用起来很方便", "整体体验满意",
    "配送速度很快", "客服耐心解决问题", "界面清楚容易使用", "很喜欢这款产品",
    "这次服务很差", "产品质量很差", "使用起来很麻烦", "整体体验失望",
    "配送速度太慢", "客服一直不解决问题", "界面混乱难以使用", "很讨厌这款产品",
]
labels = [1] * 8 + [0] * 8
x_train, x_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.25, random_state=42, stratify=labels
)
model = Pipeline([
    ("tfidf", TfidfVectorizer(analyzer="char", ngram_range=(1, 2))),
    ("classifier", LogisticRegression(max_iter=1000, random_state=42)),
])
model.fit(x_train, y_train)
predicted = model.predict(x_test)
print(classification_report(
    y_test, predicted, labels=[0, 1], target_names=["negative", "positive"],
    zero_division=0,
))
print("Prediction:", model.predict(["服务很好，使用方便"]).tolist())
```

这里最重要的不是输出了多少分，而是 **先划分数据，再在训练集上拟合整个 Pipeline**。向量器的词表与权重也需要学习，不能先在全部文本上拟合后再划分。否则测试集的信息已经进入训练过程。[数据泄漏说明](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage)

演示只有 16 条短句，并且有意构造了相似表达。这样的测试集太小，也过于简单，得分高低都不能反映真实业务效果。

## 4. 怎样读评估结果

**Precision（精确率）**问的是“被预测成这一类的样本，有多少真的属于这一类”；**Recall（召回率）**问的是“真正属于这一类的样本，有多少被找到了”。F1 是二者的调和平均。类别不均衡时，只看总体准确率容易漏掉问题。

实际项目中还需要看错例：否定词、反讽、混合情绪、拼写错误、新产品名称，以及训练数据里没有出现的表达。模型误判在哪里，往往比一个总分更有助于决定下一步怎么改。

如果存在同一用户、同一文档的多个切片，或者数据随时间变化，不应机械使用随机划分。应按用户、文档或时间分组，避免近似重复的数据同时出现在训练和测试中。

## 5. 什么时候再考虑更复杂的模型

我的建议顺序是：先整理标签和评估集，用 TF-IDF 加线性模型建立基线，再考虑上下文模型。升级时不仅比较指标，还应记录训练成本、推理延迟、运行环境和失败样本。

文本分类通常输出离散标签；连续评分才可能是回归；翻译与问答又是不同形式的生成任务。因此，不能因为文本有顺序，就把 NLP 全部称为回归问题。

## 6. 与下一篇的连接

下一篇 [Transformer 概述](/2022/10/18/zh-CN/Transformer/) 会解释注意力如何让不同位置交换信息，并用一个小型时序预测模型展示输入与输出的形状。先理解这一篇的数据流程，再学习新架构，更容易分清哪些问题来自数据，哪些来自模型。

## 参考资料

- [scikit-learn：文本特征提取](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction)
- [scikit-learn：Pipeline](https://scikit-learn.org/stable/modules/generated/sklearn.pipeline.Pipeline.html)
- [scikit-learn：常见问题与数据泄漏](https://scikit-learn.org/stable/common_pitfalls.html)
- [scikit-learn：分类指标](https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
