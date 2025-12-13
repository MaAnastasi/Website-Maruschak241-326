// API URL для загрузки данных о блюдах
const DISHES_API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";
const ORDERS_API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/orders";

// API-КЛЮЧ
const API_KEY = "cf9287df-c4f7-4c52-9b77-12f551818caf";

// Массив для хранения загруженных блюд
let dishes = [];
let dishesLoaded = false;

// Функция для загрузки данных из API
async function loadDishes() {
  try {
    console.log('Начинаем загрузку данных из API...');
    
    // Добавляем API ключ как query параметр
    const url = `${DISHES_API_URL}?api_key=${API_KEY}`;
    
    const response = await fetch(url);
    
    console.log('Ответ получен. Статус:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Текст ошибки:', errorText);
      throw new Error(`Ошибка HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Данные успешно получены. Количество блюд:', data.length);
    
    // Преобразуем данные из API в нужный формат
    dishes = data.map(item => ({
      keyword: item.keyword,
      name: item.name,
      price: item.price,
      category: mapCategory(item.category),
      kind: item.kind,
      count: item.count,
      image: item.image,
      id: item.id
    }));
    
    console.log(`Загружено ${dishes.length} блюд из API`);
    dishesLoaded = true;
    
    // Генерируем событие о загрузке данных
    document.dispatchEvent(new CustomEvent('dishesLoaded'));
    
    return dishes;
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    
    // Используем fallback данные
    dishes = getFallbackDishes();
    dishesLoaded = true;
    
    document.dispatchEvent(new CustomEvent('dishesLoaded'));
    
    return dishes;
  }
}

// Простая функция для преобразования категорий
function mapCategory(apiCategory) {
  if (apiCategory === 'main-course') return 'main';
  return apiCategory;
}

// Функция для отправки заказа
async function submitOrder(orderData) {
  try {
    console.log('Отправка заказа на сервер:', orderData);
    
    const url = `${ORDERS_API_URL}?api_key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Ошибка при отправке заказа:', error);
    return { success: false, error: error.message };
  }
}

// Загружаем данные при загрузке страницы
document.addEventListener('DOMContentLoaded', loadDishes);