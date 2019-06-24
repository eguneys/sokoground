// https://stackoverflow.com/a/1481343/3994249
export default function BitIterator(value) {
  var result = [];
  for (var x = value; x !== 0; x = x & (x - 1)) {
    var y = x ^ (-x);

    // XOR a shifted copy recovers a single 1 in the lsb's location
    var u = y ^ (y >> 1);

    // .. and isolate the bit in log2 of number of bits
    var i0 = (u & 0xAAAAAAAA) ?  1 : 0;
    var i1 = (u & 0xCCCCCCCC) ?  2 : 0;
    var i2 = (u & 0xF0F0F0F0) ?  4 : 0;
    var i3 = (u & 0xFF00FF00) ?  8 : 0;
    var i4 = (u & 0xFFFF0000) ? 16 : 0;
    var index = i4 | i3 | i2 | i1 | i0;
    result.push(index);
  }
  return result;
}
