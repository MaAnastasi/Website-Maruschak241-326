function getSortedArray(array, key) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        result.push(array[i]);
    }
    
    // Реализуем сортировку пузырьком
    for (let i = 0; i < result.length - 1; i++) {
        for (let j = 0; j < result.length - 1 - i; j++) {
            // Сравниваем значения по указанному ключу
            const currentValue = result[j][key];
            const nextValue = result[j + 1][key];
            
            // Если текущий элемент больше следующего, меняем их местами
            if (currentValue > nextValue) {
                // Меняем элементы местами
                const temp = result[j];
                result[j] = result[j + 1];
                result[j + 1] = temp;
            }
        }
    }
    
    return result;
}

const array = [
    { name: "John", age: 25 },
    { name: "Alice", age: 22 },
    { name: "Bob", age: 30 }
];

console.log(getSortedArray(array, "age"));
console.log(getSortedArray(array, "name"));
