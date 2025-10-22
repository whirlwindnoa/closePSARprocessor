import util from './util.js';
import methods from './methods/closePSAR.js';

let data = util.readCSV('./data/raw/ETHUSD2021.csv');
let SAR = methods.computeSAR(data.Close, data.Low, data.High);
util.generateOutput(SAR);

// console.log(SAR);

let trueReversals = util.extremaK(data.Close, 12);
console.log(trueReversals);

let psarReversals = util.findFlips(SAR);
console.log(psarReversals);