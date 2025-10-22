const round = (n) => { return Number(n.toFixed(3)); }

const computeSAR = (Close, Low, High) => {
  const n = Close.length;
  const out = new Array(n);

  out[0] = { SAR: Low[0], EP: High[0], alpha: 0.02 };

  for (let i = 1; i < n; i++) {
    const prev = out[i - 1];
    const prev2 = i >= 2 ? out[i - 2] : out[0];

    let isReversal = false;
    if (i >= 2) {
      const prod = (Close[i] - prev2.SAR) * (Close[i - 1] - prev.SAR);
      isReversal = prod < 0;
    }

    let kind = "none";
    if (isReversal) {
      if (Close[i] > prev.SAR) kind = 'trough';
      else                     kind = 'peak';
    }
    let alpha_n = isReversal ? 0.02 : prev.alpha;

    let EP_n;
    if (isReversal) {
      EP_n = (Close[i] > prev.SAR) ? High[i] : Low[i];
    } else {
      if (Close[i] > prev.SAR) EP_n = Math.max(prev.EP, High[i]);
      else if (Close[i] < prev.SAR) EP_n = Math.min(prev.EP, Low[i]);
      else EP_n = prev.EP;
    }

    if (!isReversal && EP_n !== prev.EP) alpha_n = Math.min(0.20, alpha_n + 0.02);

    const SAR_n = prev.SAR + alpha_n * (EP_n - prev.SAR);
    out[i] = { SAR: round(SAR_n, 3), EP: round(EP_n, 3), alpha: round(alpha_n), isReversal, kind };
  }

  return out;
}

export default { computeSAR };