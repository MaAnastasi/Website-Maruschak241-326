function gcd(a, b) {
    if (a < 0 || b < 0) {
        return "Ошибка: оба числа должны быть неотрицательными";
    }
    
    if (a === 0) return b;
    if (b === 0) return a;
    
    // Применяем алгоритм Евклида
    while (b !== 0) {
        let temp = b;      
        b = a % b;         
        a = temp;         
    }
    
    return a;
}


console.log(gcd(48, 18));    // 6
console.log(gcd(0, 5));      // 5
console.log(gcd(5, 0));      // 5
console.log(gcd(17, 13));    // 1 
console.log(gcd(100, 40));   // 20
console.log(gcd(54, 24));    // 6
console.log(gcd(-5, 10));    // "Ошибка: оба числа должны быть неотрицательными"