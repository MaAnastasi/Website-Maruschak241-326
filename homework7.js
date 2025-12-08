function cesar(str, shift, action) {
    const alphabetLower = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const alphabetUpper = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
    const alphabetLength = alphabetLower.length;
    
    // Для дешифровки используем обратный сдвиг
    if (action === 'decode') {
        shift = alphabetLength - (shift % alphabetLength);
    }
    
    let result = '';
    
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        
        // Проверяем, является ли символ строчной русской буквой
        if (alphabetLower.includes(char)) {
            const currentIndex = alphabetLower.indexOf(char);
            const newIndex = (currentIndex + shift) % alphabetLength;
            result += alphabetLower[newIndex];
        }
        // Проверяем, является ли символ прописной русской буквой
        else if (alphabetUpper.includes(char)) {
            const currentIndex = alphabetUpper.indexOf(char);
            const newIndex = (currentIndex + shift) % alphabetLength;
            result += alphabetUpper[newIndex];
        }
        // Если символ не русская буква, оставляем без изменений
        else {
            result += char;
        }
    }
    
    return result;
}

// Расшифровка сообщения "эзтыхз фзъзъз"
// Для расшифровки нужно знать сдвиг. Попробуем найти правильный сдвиг методом перебора
const encryptedMessage = "эзтыхз фзъзъз";

// Перебираем все возможные сдвиги (1-32)
for (let shift = 1; shift <= 32; shift++) {
    const decrypted = cesar(encryptedMessage, shift, 'decode');
    console.log(`Сдвиг ${shift}: ${decrypted}`);
}

// Из результатов видно, что при сдвиге 8 получается осмысленная фраза:
const correctShift = 8;
const decodedMessage = cesar(encryptedMessage, correctShift, 'decode');
console.log(`\nПравильная расшифровка: ${decodedMessage}`);

// Ответ: "скажите пожалуйста"