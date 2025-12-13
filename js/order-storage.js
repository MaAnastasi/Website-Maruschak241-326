// Ключ для хранения заказа в localStorage
const STORAGE_KEY = 'businessLunchOrder';

// Загружаем заказ из localStorage
function loadOrderFromStorage() {
  try {
    const orderJson = localStorage.getItem(STORAGE_KEY);
    if (orderJson) {
      return JSON.parse(orderJson);
    }
  } catch (e) {
    console.error('Ошибка при загрузке заказа:', e);
  }
  
  // Возвращаем пустой заказ по умолчанию
  return {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null
  };
}

// Сохраняем заказ в localStorage
function saveOrderToStorage(order) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    return true;
  } catch (e) {
    console.error('Ошибка при сохранении заказа:', e);
    return false;
  }
}

// Сохраняем выбранное блюдо
function saveSelectedDish(dish) {
  const order = loadOrderFromStorage();
  order[dish.category] = dish.id; // Используем ID вместо keyword
  saveOrderToStorage(order);
}

// Удаляем блюдо из заказа
function removeDishFromOrder(category) {
  const order = loadOrderFromStorage();
  order[category] = null;
  saveOrderToStorage(order);
}

// Очищаем весь заказ
function clearOrder() {
  localStorage.removeItem(STORAGE_KEY);
}

// Проверяем валидность комбо
function isValidCombo(order) {
  // Проверяем только ключевые слова в order
  const selectedCategories = Object.keys(order).filter(
    category => order[category] !== null && order[category] !== undefined
  );
  
  // Убираем десерт из проверки комбо
  const categoriesWithoutDessert = selectedCategories.filter(cat => cat !== 'dessert');
  
  const validCombos = [
    ['soup', 'main', 'salad', 'drink'],
    ['soup', 'main', 'drink'],
    ['soup', 'salad', 'drink'],
    ['main', 'salad', 'drink'],
    ['main', 'drink']
  ];
  
  // Сортируем для сравнения
  const sortedSelected = [...categoriesWithoutDessert].sort();
  
  return validCombos.some(combo => {
    const sortedCombo = [...combo].sort();
    return JSON.stringify(sortedSelected) === JSON.stringify(sortedCombo);
  });
}