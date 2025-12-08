function minDigit(x) {
    if (x < 0) {
        return "Ошибка: число должно быть неотрицательным";
    }
    
    if (x < 10) {
        return x;
    }
    
    let min = 9; 
    
    while (x > 0) {
        let temp = x
        let digit = x % 10; 
        if (digit < min) {
            min = digit; 
        }
        x = (x - digit) / 10; 
    }
    
    return min;
}


console.log(minDigit(12345));    // 1
console.log(minDigit(98765));    // 5
console.log(minDigit(11111));    // 1
console.log(minDigit(50932));    // 0
console.log(minDigit(7));        // 7
console.log(minDigit(0));        // 0
console.log(minDigit(100));      // 0
console.log(minDigit(-5));       // "Ошибка: число должно быть неотрицательным"