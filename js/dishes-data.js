/// API URL для загрузки данных о блюдах
const API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";

//API-КЛЮЧ 
const API_KEY = "cf9287df-c4f7-4c52-9b77-12f551818caf";

// Массив для хранения загруженных блюд
let dishes = [];

/**
 * Функция для загрузки данных о блюдах через API
 */
async function loadDishes() {
  try {
    // Определяем URL API в зависимости от окружения
    // Для локальной разработки используем один URL, для хостинга - другой
    const API_URL = window.location.hostname.includes('netlify.app') || 
                    window.location.hostname.includes('github.io')
      ? 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes'  // Для Netlify/GitHub Pages
      : 'http://lab7-api.std-900.ist.mospolytech.ru/api/dishes';   // Для хостинга МосПолитеха
    
    console.log('Загрузка данных из API:', API_URL);
    
    // Отправляем запрос к API
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Проверяем успешность запроса
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
    }
    
    // Получаем данные в формате JSON
    const data = await response.json();
    console.log('Данные получены:', data.length, 'блюд');
    
    // Преобразуем данные из API в нужный формат
    dishes = data.map(item => {
      // Маппинг категорий из API в локальные названия
      const categoryMap = {
        'soup': 'soup',
        'main-course': 'main',
        'salad': 'salad',
        'drink': 'drink',
        'dessert': 'dessert'
      };
      
      return {
        keyword: item.keyword,
        name: item.name,
        price: item.price,
        category: categoryMap[item.category] || item.category,
        kind: item.kind,
        count: item.count,
        image: item.image
      };
    });
    
    console.log(`Успешно загружено ${dishes.length} блюд из API`);
    
    // Инициализируем приложение после загрузки данных
    if (typeof initializeApp === 'function') {
      initializeApp();
    } else {
      console.error('Функция initializeApp не найдена');
    }
    
    return dishes;
    
  } catch (error) {
    console.error('Ошибка при загрузке данных из API:', error);
    
    // Запасной вариант: используем статические данные
    console.warn('Используем статические данные...');
    dishes = getFallbackDishes();
    
    // Инициализируем приложение с запасными данными
    if (typeof initializeApp === 'function') {
      initializeApp();
    }
    
    return dishes;
  }
}

// Функция для преобразования категорий из API в локальные
function mapCategory(apiCategory) {
  const categoryMap = {
    'soup': 'soup',
    'main-course': 'main',
    'salad': 'salad',
    'drink': 'drink',
    'dessert': 'dessert'
  };
  
  return categoryMap[apiCategory] || apiCategory;
}

// Загружаем данные при загрузке страницы
document.addEventListener('DOMContentLoaded', loadDishes);