function pow(x, n) {
  if (n < 0 || !Number.isInteger(n)) {
    return "Ошибка: n должно быть натуральным числом";
  }
  
  let result = 1;
  
  for (let i = 0; i < n; i++) {
    result *= x;
  }
  
  return result;
}

console.log(pow(2, 3));  // 8
console.log(pow(5, 2));  // 25
console.log(pow(3, 4));  // 81
console.log(pow(7, 0));  // 1
console.log(pow(2, -1)); // "Ошибка: n должно быть натуральным числом