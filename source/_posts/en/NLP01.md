---
title: NLP
date: 2022-09-08
updated: 2026-09-15
tags: [NLP, Machine-Learning]
categories: [Machine-Learning]
language: en
description: A practical introduction to NLP tasks, text representations, a working classification baseline, and evaluation.
---

[阅读中文版]({% post_path zh-CN/NLP01 %})

Natural language processing is about working with human language computationally. This introduction follows a practical path: define the task, prepare the data, represent the text, train a baseline, and evaluate it.

> Originally published in 2022; completed and revised in September 2026. The examples below use a tiny, invented dataset for teaching, not for benchmarking.

<!-- more -->

## Start with the task

A classifier returns a label for a review. A sequence-labeling system locates entities such as names and organizations. A retrieval system returns relevant documents. A generation system produces an answer, summary, or translation. These outputs require different datasets and evaluation methods.

A review such as “The service was good, but the wait was long” also illustrates a labeling decision: a single sentiment label may not capture every aspect. Define the desired output and acceptable errors before choosing an architecture.

## Representing text

Bag-of-words features record which tokens occur. TF-IDF additionally considers how widely a term occurs across the corpus, making very common terms less distinctive. These sparse representations provide a useful, inexpensive baseline; see the [scikit-learn text feature guide](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction).

Dense word embeddings replace sparse counts with learned vectors. Static embeddings usually give a word the same representation in every sentence. Contextual models instead change a token's representation based on its surrounding text. Transformer is an important architecture for this, but it is not a prerequisite for every useful NLP system.

A token is not necessarily a word. Character n-grams are another option, and can avoid a separate word-segmentation dependency. The following example uses them to keep the experiment small.

## A runnable baseline

Install `scikit-learn` inside a project virtual environment, then save this as `nlp_demo.py` and run it with Python:

```bash
python -m pip install scikit-learn
```

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

texts = [
    "the service was good", "the product quality was good",
    "very easy to use", "a satisfying experience",
    "delivery was fast", "helpful customer support",
    "a clear and useful interface", "I really like this product",
    "the service was bad", "the product quality was bad",
    "very difficult to use", "a disappointing experience",
    "delivery was slow", "unhelpful customer support",
    "a confusing and useless interface", "I really dislike this product",
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
print("Prediction:", model.predict(["good service and easy to use"]).tolist())
```

**Split first, then fit the pipeline on the training data.** The vectorizer learns a vocabulary and weights too. Fitting it on all the data before splitting would let the test set influence training. Keeping transformations in a pipeline helps avoid this mistake.

There are only 16 invented sentences here, with deliberately repetitive wording. Neither a high nor a low score on this split establishes real-world performance.

## Evaluation is more than accuracy

Precision asks how many examples predicted as a class actually belong to it. Recall asks how many actual members of that class were found. F1 combines them through their harmonic mean. A single overall accuracy can hide poor performance on a minority class.

Inspect mistakes involving negation, sarcasm, mixed sentiment, typos, and unfamiliar topics. When documents share an author or originate from the same source, split by those groups when appropriate. For a deployment task involving future data, consider a time-based evaluation instead of mechanically choosing a random split. Do not let near-duplicate examples appear on both sides.

## Choosing the next model

A sensible experiment starts with clear labels, a held-out evaluation set, and a simple baseline. A more sophisticated model should be judged on the same evaluation protocol, together with its latency, resource requirements, and failure cases.

NLP is not simply regression: classification predicts categories, regression predicts continuous values, and generation produces sequences. The fact that language has an order does not make every language task a regression problem.

The next note, [Transformer]({% post_path en/Transformer %}), explains how attention connects positions and includes a small forecasting model with explicit tensor shapes.

## References

- [Text feature extraction](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction)
- [Pipeline](https://scikit-learn.org/stable/modules/generated/sklearn.pipeline.Pipeline.html)
- [Common pitfalls and data leakage](https://scikit-learn.org/stable/common_pitfalls.html)
- [Classification metrics](https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
