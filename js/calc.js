export function combinations(n, r) {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;
    let c = 1;
    for (let i = 1; i <= r; i++) c = c * (n - i + 1) / i;
    return c;
}

export function binomialProbability(n, k, p) {
    if (p === 0 && k === 0) return 1;
    if (p === 0 && k > 0) return 0;
    return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// 確率配列を生成する関数
export function calculateProbabilities(initialSlots, currentHits, unacquiredTargets, totalPoolSize) {
    let exactProbs = [0, 0, 0, 0, 0, 0];
    if (initialSlots === 4) {
        const p = currentHits / 4.0;
        for (let k = 0; k <= 5; k++) exactProbs[k] = binomialProbability(5, k, p);
    } else {
        const remainingPoolSize = totalPoolSize - 3;
        const p_revealHit = remainingPoolSize > 0 ? (unacquiredTargets / remainingPoolSize) : 0;
        const p_revealMiss = 1.0 - p_revealHit;
        const p_upgradeA = Math.min(currentHits + 1, 4) / 4.0;
        const p_upgradeB = currentHits / 4.0;
        for (let k = 0; k <= 4; k++) {
            exactProbs[k] = (p_revealHit * binomialProbability(4, k, p_upgradeA)) + (p_revealMiss * binomialProbability(4, k, p_upgradeB));
        }
    }
    return exactProbs;
}