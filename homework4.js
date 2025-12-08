function pluralizeRecords(n) {
    // Проверяем корректность входных данных
    if (n < 0 || !Number.isInteger(n)) {
        return "Некорректное значение n";
    }
    
    // Определяем форму для слова "запись"
    let recordsForm;
    
    // Правила для русского языка:
    // one: 1, 21, 31, ... (но не 11, 111, 211...)
    // few: 2-4, 22-24, 32-34, ... (но не 12-14, 112-114...)
    // many: 0, 5-20, 25-30, 35-40, ...
    
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        recordsForm = "записей";
    } else if (lastDigit === 1) {
        recordsForm = "запись";
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        recordsForm = "записи";
    } else {
        recordsForm = "записей";
    }
    
    // Определяем форму для слова "найдено" (глагол не меняется в русском языке)
    const foundForm = "найдено";
    
    // Формируем окончательную строку
    return `В результате выполнения запроса было ${foundForm} ${n} ${recordsForm}`;
}

// Примеры использования:
console.log(pluralizeRecords(0));  // "В результате выполнения запроса было найдено 0 записей"
console.log(pluralizeRecords(1));  // "В результате выполнения запроса было найдено 1 запись"
console.log(pluralizeRecords(2));  // "В результате выполнения запроса было найдено 2 записи"
console.log(pluralizeRecords(5));  // "В результате выполнения запроса было найдено 5 записей"
console.log(pluralizeRecords(11)); // "В результате выполнения запроса было найдено 11 записей"
console.log(pluralizeRecords(21)); // "В результате выполнения запроса было найдено 21 запись"
console.log(pluralizeRecords(22)); // "В результате выполнения запроса было найдено 22 записи"
console.log(pluralizeRecords(25)); // "В результате выполнения запроса было найдено 25 записей"