export default function (name, options) {
  let sum = 0;
  let count = 0;
  const counter = function (v) {
    if (typeof v === 'number') {
      sum += v;
      count++;
    }
  };
  counter.counterName = name;
  const get = counter.get = function () {
    const v = count ? sum / count : 0; // количество событий в минуту
    return Math.round(v * 100) / 100; // точность до процента
  };
  counter.getAndReset = function () {
    let v = get();
    sum = 0;
    count = 0;
    return v;
  };
  return counter;
}
