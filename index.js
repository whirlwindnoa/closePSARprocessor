import util from './util.js';
import methods from './methods/closePSAR.js';

let data = util.readCSV('./data/raw/ETHUSD2021.csv');
let SAR  = methods.computeSAR(data.Close, data.Low, data.High);
util.generateOutput(SAR);

let trueReversals = util.extremaK(data.Close, 12);
let psarReversals  = util.findFlips(SAR);

const trueList = [
  ...trueReversals.peaks.map(i => ({ i, type: 'peak' })),
  ...trueReversals.troughs.map(i => ({ i, type: 'trough' }))
].sort((a,b) => a.i - b.i);

const psarList = [
  ...psarReversals.peaks.map(i => ({ i, dir: 'bearish' })),
  ...psarReversals.troughs.map(i => ({ i, dir: 'bullish' }))
].sort((a,b) => a.i - b.i);

function matchDirectional(trueList, psarList, data, maxLag = 30) {
  const used = new Array(psarList.length).fill(false);
  const matches = [];
  const misses = [];

  const n = data.Close.length;

  for (const tr of trueList) {
    const want = tr.type === 'peak' ? 'bearish' : 'bullish';
    let j = -1;

    for (let k = 0; k < psarList.length; k++) {
      const f = psarList[k];
      if (!used[k] && f.dir === want && f.i > tr.i && (f.i - tr.i) <= maxLag) {
        j = k;
        break;
      }
    }

    if (j === -1) {
      misses.push(tr);
      continue;
    }

    used[j] = true;
    const f = psarList[j];

    if (tr.i >= n || f.i >= n) {
      console.warn(`Index out of range: trueIndex=${tr.i}, psarIndex=${f.i}, dataLength=${n}`);
      continue;
    }

    const truePrice = data.Close[tr.i];
    const flipPrice = data.Close[f.i];
    const absDiff   = flipPrice - truePrice;
    const pctDiff   = (absDiff / truePrice) * 100;

    matches.push({
      type: tr.type,
      dir:  f.dir,
      trueIndex: tr.i,
      psarIndex: f.i,
      lagDays:    f.i - tr.i,
      lagWeeks:   (f.i - tr.i) / 7,
      truePrice,
      flipPrice,
      absDiff,
      pctDiff
    });
  }

  const spurious = psarList.filter((_, k) => !used[k]);
  const lags    = matches.map(m => m.lagDays);
  const meanLag = lags.length ? lags.reduce((a,b)=>a+b,0)/lags.length : null;

  const absDiffs = matches.map(m => Math.abs(m.absDiff));
  const meanAbsDiff = absDiffs.length ? absDiffs.reduce((a,b)=>a+b,0)/absDiffs.length : null;

  const pctDiffs = matches.map(m => Math.abs(m.pctDiff));
  const meanPctDiff = pctDiffs.length ? pctDiffs.reduce((a,b)=>a+b,0)/pctDiffs.length : null;

  return {
    matches,
    misses,
    spurious,
    precision:          matches.length / psarList.length,
    recall:             matches.length / trueList.length,
    meanLagDays:        meanLag,
    meanLagWeeks:       meanLag ? meanLag / 7 : null,
    meanAbsPriceDiff:   meanAbsDiff,
    meanPctPriceDiff:   meanPctDiff
  };
}

const report = matchDirectional(trueList, psarList, data, 30);
console.log('Matches details:', report.matches);
console.log('Report:', report);
