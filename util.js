import fs from 'fs';

const readCSV = (filePath) => {
  let csvText = fs.readFileSync(filePath, "utf-8");

  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines[0].split(";").map(h => h.trim().toLowerCase());

  const closeIdx = headers.indexOf("close");
  const lowIdx = headers.indexOf("low");
  const highIdx = headers.indexOf("high");

  if (closeIdx === -1 || lowIdx === -1 || highIdx === -1) {
      throw new Error("CSV must include headers: Close, Low, High");
  }

  const Close = [];
  const Low = [];
  const High = [];

  for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(";").map(v => parseFloat(v.trim()));

      Close.push(cols[closeIdx]);
      Low.push(cols[lowIdx]);
      High.push(cols[highIdx]);
  }

  return { Close, Low, High };
}

const generateOutput = (out) => {
  const lines = ["SAR;EP;alpha;isReversal;kind"];
  for (let i = 0; i < out.length; i++) {
    lines.push(`${out[i].SAR};${out[i].EP};${out[i].alpha};${out[i].isReversal};${out[i].kind}`);
  }
  fs.writeFileSync("./data/out/ETHUSD2021PSAR.csv", lines.join("\n"), "utf-8");
}

const extremaK = (close, k = 15) => {
  const peaks=[], troughs=[];
  for (let i = k; i < close.length - k; i++) {
    let isMax = true, isMin = true;
    for (let j = 1; j <= k; j++) {
      if (close[i] <= close[i-j] || close[i] <= close[i+j]) isMax = false;
      if (close[i] >= close[i-j] || close[i] >= close[i+j]) isMin = false;
      if (!isMax && !isMin) break;
    }
    if (isMax)  peaks.push(i);
    if (isMin)  troughs.push(i);
  }
  return { peaks, troughs };
}

const findFlips = (data) => {
  const peaks=[], troughs=[];
  for (let i = 0; i < data.length; i++) {
    if (data[i].isReversal) {
      if (data[i].kind == "peak") peaks.push(i);
      else troughs.push(i);
    }
  }
  return { peaks, troughs };
}

export default { readCSV, generateOutput, extremaK, findFlips };