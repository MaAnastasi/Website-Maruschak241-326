function fibb(n) {
    if (n < 0 || n > 1000 || !Number.isInteger(n)) {
        return "Ошибка: n должно быть целым неотрицательным числом <= 1000";
    }
    
    if (n === 0) return 0;
    if (n === 1) return 1;
    
    let a = 0;
    let b = 1;
    
    for (let i = 2; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    
    return b;
}


console.log(fibb(0));     // 0
console.log(fibb(1));     // 1
console.log(fibb(2));     // 1
console.log(fibb(3));     // 2
console.log(fibb(4));     // 3
console.log(fibb(5));     // 5
console.log(fibb(6));     // 8
console.log(fibb(10));    // 55
console.log(fibb(-5));    // "Ошибка: n должно быть целым неотрицательным числом <= 1000"
console.log(fibb(1001));  // "Ошибка: n должно быть целым неотрицательным числом <= 1000"