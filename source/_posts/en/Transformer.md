---
title: A short brief of Transformer
date: 2022-09-09
updated: 2026-09-15
tags: [NLP, Transformer, PyTorch]
categories: [Machine-Learning]
language: en
description: Attention, positional information, encoder structure, and a minimal PyTorch forecasting example with clear evaluation limits.
---

[阅读中文版]({% post_path zh-CN/Transformer %})

The original [Attention Is All You Need](https://arxiv.org/abs/1706.03762) introduced Transformer as an encoder–decoder architecture for machine translation. A useful starting question is: **how does each position retrieve the information it needs from other positions?**

> This note retains its original publication date and URL. It was completed and revised in September 2026. The code below demonstrates tensor flow, not trained forecasting performance.

<!-- more -->

## Architecture is not the same as task

Transformer consumes vectors. In language, they can represent tokens; in forecasting, they can represent numerical observations at different times. Its output can be adapted for classification, generation, or continuous-value prediction. An ordered input does not make every application a regression task.

The original design has both an encoder and a decoder. Encoder-only and decoder-only designs are also possible, with different information-flow constraints.

## Attention through Q, K, and V

Starting with an input matrix X, learned projections produce:

```text
Q = X Wq     K = X Wk     V = X Wv
Attention(Q, K, V) = softmax(Q Kᵀ / sqrt(dk)) V
```

A query describes what a position is looking for, a key provides a matching signal, and a value supplies the information to combine. This is an intuition, not a claim that every learned feature has a fixed human-readable meaning.

Dot products produce matching scores. Scaling controls their magnitude, softmax normalizes across attended positions, and the resulting weights combine values. Attention weights are neither probabilities that statements are true nor a direct causal explanation.

Multiple heads use separate projections, then concatenate and project their outputs. In the standard implementation, the model width must be divisible by the number of heads.

## Inside an encoder layer

A simplified original, post-normalization encoder layer is:

```text
input → multi-head self-attention → residual addition + LayerNorm
      → position-wise feed-forward network → residual addition + LayerNorm
```

The feed-forward network applies shared transformations independently to positions. Residual connections preserve a direct path for the input. LayerNorm normalizes features, rather than performing the same operation as BatchNorm. Other designs use pre-normalization instead.

The original decoder also contains masked self-attention and cross-attention over the encoder output.

## Positions and masks

Ordinary self-attention without a positional mechanism does not encode which index an element originally occupied. The original paper uses sine and cosine features; learned positional embeddings are another option.

Padding masks exclude padded positions. Causal masks prevent a position from reading future target tokens. For PyTorch's `nn.Transformer` family, `True` in a boolean mask means that attention is disallowed. Do not assume every attention API uses that same boolean convention.

For a model that receives twelve already-observed days and predicts day thirteen, those twelve positions may attend to each other. That is not inherently future leakage. A model trained to predict the next token at every input position needs the appropriate causal constraint instead.

## Minimal forecasting example

Install an appropriate build using the [PyTorch installation guide](https://pytorch.org/get-started/locally/). This is a **plain encoder demonstration, not a reproduction of the ConvTrans model in DataMiningFinal**. Random input checks shape compatibility only.

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

Each observation is projected to 32 features and receives a fixed positional encoding. One encoder layer mixes information, and the final position feeds a one-step output head. The input check makes an incorrect lookback length explicit.

Training still requires real inputs and targets, a loss, an optimizer, and a validation protocol. Numbers emitted by this randomly initialized model are not meaningful forecasts.

## Strengths and costs

Attention connects distant positions directly and allows parallel processing of an observed input sequence. Standard full attention also forms an attention matrix that grows quadratically with sequence length. Greater capacity introduces computation, tuning, and overfitting costs.

The ability to connect distant positions does not prove that a model learns useful long-term structure. Compare it with simpler alternatives under the same split and metric definitions.

## Revisiting DataMiningFinal

My [DataMiningFinal](https://github.com/happys2333/DataMiningFinal) course project uses 42 days of case observations for each of Beijing, Shanghai, Shenzhen, and Changchun. It constructs twelve-day inputs for next-day prediction and compares ConvTrans with LSTM and regression baselines.

The useful experience is the workflow: data preparation, window construction, model comparison, and visualization. A close fit on such a small dataset should not be presented as a validated real-world forecasting system.

A careful follow-up should split by target time, fit preprocessing on training observations only, and include simple baselines such as the last observed value. Historical observations may be used as context for later test targets, but training targets must not cross the split boundary. Rolling one-step forecasts that receive new true observations are also different from multi-step forecasts that feed predictions back as inputs.

These data do not establish cross-city generalization or support causal conclusions about public policy. The project is an educational, small-data study rather than a system validated for real decisions.

## References

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [PyTorch Transformer](https://docs.pytorch.org/docs/stable/generated/torch.nn.Transformer.html)
- [TransformerEncoderLayer](https://docs.pytorch.org/docs/stable/generated/torch.nn.TransformerEncoderLayer.html)
- [TransformerEncoder](https://docs.pytorch.org/docs/stable/generated/torch.nn.TransformerEncoder.html)
- [DataMiningFinal](https://github.com/happys2333/DataMiningFinal)
