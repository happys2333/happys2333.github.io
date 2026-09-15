---
title: Transformer概述
date: 2022-10-18
updated: 2026-09-15
tags: [NLP, Transformer, PyTorch]
categories: [Machine-Learning]
language: zh-CN
description: 从注意力公式、位置编码与编码器结构，到一个最小可运行的 PyTorch 时序预测模型。
---

[Read in English](/2022/09/09/en/Transformer/)

Transformer 最早在 [Attention Is All You Need](https://arxiv.org/abs/1706.03762) 中以机器翻译架构的形式提出。理解它的一个起点是：**每个位置怎样从其他位置取回当前需要的信息？**

> 这篇旧稿于 2026 年 9 月补全。保留原始链接与项目背景，修正了任务分类、预测评估等表述。示例代码用于理解模型结构，不代表训练结果。

<!-- more -->

## 1. Transformer 处理的是什么

输入是一组向量。对语言任务，这些向量来自 token embedding；对时间序列，可以来自每个时刻的数值特征投影。模型让位置之间交换信息，再把结果映射到任务需要的输出。

因此，Transformer 是架构，不是一种固定任务。它可以用于分类、序列生成或连续值预测。原版包含 Encoder 与 Decoder；其他设计也可以只使用其中一种结构。

## 2. 从 Q、K、V 理解注意力

设输入矩阵为 X，通过不同的可学习线性映射得到：

```text
Q = X Wq     K = X Wk     V = X Wv
Attention(Q, K, V) = softmax(Q Kᵀ / sqrt(dk)) V
```

可以把 Query 看作“我要找什么”，Key 看作“我提供什么线索”，Value 看作“实际传递的信息”。这个说法只是理解线性投影的一种类比，并不意味着每个维度都有固定的人类语义。

Q 与 K 的点积给出位置间的匹配分数。除以 `sqrt(dk)` 控制尺度；softmax 沿被关注的位置归一化；最后用这些权重对 V 加权求和。**注意力权重并不是事实正确率，也不能直接当作因果解释。**

多头注意力用多组投影并行学习不同的交互模式，再拼接并投影回模型维度。`d_model` 应能被头数整除。

## 3. 一个编码器层里有什么

在原始的 post-norm 编码器中，可以简化为：

```text
输入 → 多头自注意力 → 残差相加与层归一化
     → 逐位置前馈网络 → 残差相加与层归一化 → 输出
```

前馈网络对每个位置使用同一组参数，通常先扩大特征维度，再经过非线性激活并投影回来。残差连接让输入信息有直接路径向后传递。LayerNorm 规范化特征；它不等同于 BatchNorm。

原版 Decoder 还包括遮住未来 token 的自注意力，以及读取 Encoder 输出的交叉注意力。具体实现也可能使用 pre-norm，不能把一种归一化顺序当成全部 Transformer 的唯一结构。

## 4. 为什么需要位置信息与 mask

不加入位置相关机制时，普通自注意力本身不能区分“这个元素原本是第几个”。原论文采用正弦和余弦位置编码；可学习的位置向量也是一种选择。

mask 则控制哪些位置允许参与信息交换。**Padding mask** 忽略补齐位置；**causal mask** 防止某个位置读取它后面的目标 token。在 PyTorch 的 `nn.Transformer` 系列接口中，布尔 mask 的 `True` 表示禁止关注；不要把不同注意力 API 的布尔约定混用。

一个只接收过去 12 天、直接预测第 13 天的 Encoder，可以让这 12 个已观测位置彼此完整关注；这本身不构成未来信息泄漏。但如果对序列中每个位置都预测“下一步”，就需要根据训练任务正确设置因果约束。

## 5. 一个最小 PyTorch 预测模型

按 [PyTorch 官方安装说明](https://pytorch.org/get-started/locally/)安装适合当前平台的版本。下面是**普通 Encoder 演示，不是 DataMiningFinal 中 ConvTrans 的复现**。没有训练循环；随机输入只检查张量流与输出形状。

```python
import math
import torch
from torch import nn


class TinyForecaster(nn.Module):
    """Map a fixed window [batch, lookback, 1] to [batch, 1]."""

    def __init__(self, lookback: int = 12):
        super().__init__()
        if lookback < 1:
            raise ValueError("lookback must be positive")
        self.lookback = lookback
        width = 32
        self.input_projection = nn.Linear(1, width)
        position = torch.arange(lookback, dtype=torch.float32).unsqueeze(1)
        scale = torch.exp(torch.arange(0, width, 2) * (-math.log(10000.0) / width))
        encoding = torch.zeros(lookback, width)
        encoding[:, 0::2] = torch.sin(position * scale)
        encoding[:, 1::2] = torch.cos(position * scale)
        self.register_buffer("position_encoding", encoding.unsqueeze(0))
        layer = nn.TransformerEncoderLayer(
            d_model=width, nhead=4, dim_feedforward=64,
            dropout=0.1, batch_first=True,
        )
        self.encoder = nn.TransformerEncoder(layer, num_layers=1)
        self.output = nn.Linear(width, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.ndim != 3 or x.shape[1:] != (self.lookback, 1):
            raise ValueError(f"Expected [batch, {self.lookback}, 1]")
        hidden = self.input_projection(x) + self.position_encoding
        hidden = self.encoder(hidden)
        return self.output(hidden[:, -1, :])


if __name__ == "__main__":
    torch.manual_seed(42)
    model = TinyForecaster().eval()
    with torch.inference_mode():
        prediction = model(torch.randn(4, 12, 1))
    print(prediction.shape)  # torch.Size([4, 1])
```

这个模型先把每个数值投影成 32 维向量，加上固定位置编码，经一个编码器层后，用最后一个位置的表示输出下一步预测。构造时固定窗口长度，输入不匹配会明确报错。

实际训练还需要准备目标值、损失函数、优化器与验证集。不能把上面随机初始化模型输出的数值解释成有效预测。

## 6. 优势与代价

自注意力使较远位置可以直接交换信息，训练时也不必像基本 RNN 那样逐步递推整个输入序列。但标准全注意力的注意力矩阵随序列长度平方增长。复杂模型还会增加调参、计算与过拟合风险。

“能连接远处位置”也不等于“必然学到了长期规律”。是否优于线性模型、LSTM 或其他结构，需要在同一个数据划分和评估口径下验证。

## 7. 回到 DataMiningFinal

我的 [DataMiningFinal](https://github.com/happys2333/DataMiningFinal) 是一个课程实验：使用北京、上海、深圳、长春的病例序列，每座城市只有 42 天数据，以过去 12 天构造下一天的预测输入，并比较 ConvTrans、LSTM 与回归基线。

这段经历更值得保留的是数据整理、滑动窗口构造、模型对比与可视化流程，而不是把有限样本的拟合结果包装成可靠的现实预测。

重新审视这类实验时，我会重点检查：

1. **按目标时间划分数据。** 验证或测试输入可以使用此前已观测的历史，但目标不能越过划分边界进入训练。
2. **只在训练区间拟合预处理。** 标准化参数不能用全量数据计算。
3. **加入简单基线。** 例如下一天等于最后一天、训练期均值或简单线性模型。
4. **区分评估协议。** 每次获得真实新观测后的一步预测，不等于把模型预测值不断送回的多步滚动预测。

模型拟合曲线好看，并不自动说明具有跨城市泛化能力。这个数据规模与特征设置也不足以判断公共政策的因果效果。它应被视为小样本教学探索，而不是用于实际决策的已验证系统。

## 参考资料

- [Vaswani et al., Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [PyTorch：Transformer](https://docs.pytorch.org/docs/stable/generated/torch.nn.Transformer.html)
- [PyTorch：TransformerEncoderLayer](https://docs.pytorch.org/docs/stable/generated/torch.nn.TransformerEncoderLayer.html)
- [PyTorch：TransformerEncoder](https://docs.pytorch.org/docs/stable/generated/torch.nn.TransformerEncoder.html)
- [DataMiningFinal：原始项目与数据说明](https://github.com/happys2333/DataMiningFinal)
