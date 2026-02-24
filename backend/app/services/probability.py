from __future__ import annotations

import numpy as np
from numpy.typing import NDArray
from sklearn.linear_model import LinearRegression


def calculate_hit_rate(
    values: list[float],
    line: float,
    direction: str,
) -> float:
    """Historical hit rate: percentage of games where the stat cleared the line."""
    if not values:
        return 0.0

    if direction == "over":
        hits = sum(1 for v in values if v > line)
    else:
        hits = sum(1 for v in values if v < line)

    return hits / len(values)


def build_projection(values: list[float]) -> float:
    """
    Project the next game's stat value using linear regression on
    a rolling-average feature set.

    Features per game index i:
      - rolling 3-game average up to i
      - rolling 5-game average up to i
      - game index (recency weight)
    """
    if len(values) < 3:
        return float(np.mean(values)) if values else 0.0

    chronological = list(reversed(values))
    n = len(chronological)

    features: list[list[float]] = []
    targets: list[float] = []

    for i in range(2, n):
        roll3 = float(np.mean(chronological[max(0, i - 3) : i]))
        roll5 = float(np.mean(chronological[max(0, i - 5) : i]))
        features.append([roll3, roll5, float(i)])
        targets.append(chronological[i])

    if len(features) < 2:
        return float(np.mean(values))

    X: NDArray[np.float64] = np.array(features)
    y: NDArray[np.float64] = np.array(targets)

    model = LinearRegression()
    model.fit(X, y)

    last_roll3 = float(np.mean(chronological[-3:]))
    last_roll5 = float(np.mean(chronological[-5:]))
    next_idx = float(n)

    prediction: float = float(model.predict(np.array([[last_roll3, last_roll5, next_idx]]))[0])
    return max(prediction, 0.0)


def compute_model_probability(
    projected_value: float,
    line: float,
    direction: str,
    values: list[float],
) -> float:
    """
    Estimate the probability of clearing the line based on the
    projected value and historical variance.
    """
    if not values or len(values) < 2:
        return 0.5

    std = float(np.std(values, ddof=1))
    if std == 0:
        if direction == "over":
            return 1.0 if projected_value > line else 0.0
        return 1.0 if projected_value < line else 0.0

    z = (projected_value - line) / std
    if direction == "under":
        z = -z

    prob = _norm_cdf(z)
    return round(min(max(prob, 0.01), 0.99), 4)


def compute_confidence(
    hit_rate: float,
    model_probability: float,
    sample_size: int,
) -> float:
    """
    Weighted confidence score combining historical hit rate,
    model probability, and sample size reliability.

    Returns a value between 0 and 1.
    """
    size_weight = min(sample_size / 15.0, 1.0)

    agreement = 1.0 - abs(hit_rate - model_probability)

    confidence = (
        0.40 * hit_rate
        + 0.35 * model_probability
        + 0.15 * agreement
        + 0.10 * size_weight
    )
    return round(min(max(confidence, 0.0), 1.0), 4)


def _norm_cdf(z: float) -> float:
    """Approximate the standard normal CDF using the logistic function."""
    return 1.0 / (1.0 + np.exp(-1.7 * z))
