// Форматирование цены
const priceFormatter = new Intl.NumberFormat("ru-RU");
const formatPrice = (value) => `${priceFormatter.format(value)}₽`;

// Основная функция инициализации
async function initializeLunchPage() {
  console.log('Инициализация страницы выбора блюд...');
  
  // Ждем загрузки блюд, если они еще не загружены
  if (!dishesLoaded) {
    console.log('Ожидание загрузки блюд...');
    await new Promise(resolve => {
      document.addEventListener('dishesLoaded', resolve);
    });
  }
  
  console.log('Блюда загружены, начинаем рендеринг');
  
  // Загружаем сохраненный заказ
  const savedOrder = loadOrderFromStorage();
  console.log('Сохраненный заказ:', savedOrder);
  
  // Создаем объект для хранения полных данных блюд
  const selectedDishes = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null
  };
  
  // Заполняем полными данными блюд
  Object.keys(savedOrder).forEach(category => {
    const dishId = savedOrder[category];
    if (dishId && dishes.length > 0) {
      const dish = dishes.find(d => d.id === dishId);
      if (dish) {
        selectedDishes[category] = dish;
      }
    }
  });
  
  console.log('Полные данные выбранных блюд:', selectedDishes);
  
  // Рендерим все категории блюд
  renderAllCategories(selectedDishes);
  
  // Создаем панель перехода к оформлению
  createOrderPanel(selectedDishes);
  
  // Обработчик кнопки очистки выбора
  const resetBtn = document.querySelector('.reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Вы уверены, что хотите очистить весь заказ?')) {
        clearOrder();
        location.reload();
      }
    });
  }
}

// Рендерим все категории блюд
function renderAllCategories(selectedDishes) {
  const categories = ['soup', 'main', 'salad', 'drink', 'dessert'];
  
  categories.forEach(category => {
    const section = document.querySelector(`[data-category="${category}"]`);
    if (!section) return;
    
    const grid = section.querySelector('[data-grid]');
    if (!grid) return;
    
    // Фильтруем блюда по категории
    const categoryDishes = dishes.filter(dish => dish.category === category);
    
    // Сортируем по имени
    categoryDishes.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    
    // Очищаем сетку
    grid.innerHTML = '';
    
    if (categoryDishes.length === 0) {
      grid.innerHTML = '<p class="no-dishes">Нет доступных блюд в этой категории</p>';
      return;
    }
    
    // Рендерим каждое блюдо
    categoryDishes.forEach(dish => {
      const isSelected = selectedDishes[category]?.id === dish.id;
      
      const card = document.createElement('article');
      card.className = 'dish-card' + (isSelected ? ' selected' : '');
      card.dataset.id = dish.id;
      card.dataset.category = dish.category;
      
      card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}" loading="lazy">
        <p class="price">${formatPrice(dish.price)}</p>
        <p class="name">${dish.name}</p>
        <p class="weight">${dish.count}</p>
        <button type="button" class="add-btn ${isSelected ? 'selected' : ''}" 
                ${isSelected ? 'disabled' : ''}>
          ${isSelected ? 'Выбрано!' : 'Добавить'}
        </button>
      `;
      
      // Обработчик клика по кнопке
      const btn = card.querySelector('.add-btn');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectDish(dish, selectedDishes);
      });
      
      // Обработчик клика по карточке
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          selectDish(dish, selectedDishes);
        }
      });
      
      grid.appendChild(card);
    });
    
    // Настройка фильтров
    setupFilters(section, categoryDishes, selectedDishes);
  });
}

// Настройка фильтров для категории
function setupFilters(section, categoryDishes, selectedDishes) {
  const filtersContainer = section.querySelector('.filters');
  if (!filtersContainer) return;
  
  const grid = section.querySelector('[data-grid]');
  const filterBtns = filtersContainer.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Убираем активный класс у всех кнопок
      filterBtns.forEach(b => b.classList.remove('active'));
      
      // Добавляем активный класс текущей кнопке
      btn.classList.add('active');
      
      // Фильтруем блюда
      const filterKind = btn.dataset.kind;
      let filteredDishes = [...categoryDishes];
      
      if (filterKind !== 'all') {
        filteredDishes = categoryDishes.filter(dish => dish.kind === filterKind);
      }
      
      // Очищаем и перерисовываем сетку
      grid.innerHTML = '';
      
      if (filteredDishes.length === 0) {
        grid.innerHTML = '<p class="no-dishes">Нет блюд по выбранному фильтру</p>';
        return;
      }
      
      filteredDishes.forEach(dish => {
        // Проверяем, выбрано ли это блюдо
        const currentOrder = loadOrderFromStorage();
        const isSelected = currentOrder[dish.category] === dish.id;
        
        const card = document.createElement('article');
        card.className = 'dish-card' + (isSelected ? ' selected' : '');
        card.dataset.id = dish.id;
        card.dataset.category = dish.category;
        
        card.innerHTML = `
          <img src="${dish.image}" alt="${dish.name}" loading="lazy">
          <p class="price">${formatPrice(dish.price)}</p>
          <p class="name">${dish.name}</p>
          <p class="weight">${dish.count}</p>
          <button type="button" class="add-btn ${isSelected ? 'selected' : ''}" 
                  ${isSelected ? 'disabled' : ''}>
            ${isSelected ? 'Выбрано!' : 'Добавить'}
          </button>
        `;
        
        const btnElement = card.querySelector('.add-btn');
        btnElement.addEventListener('click', (e) => {
          e.stopPropagation();
          // Получаем актуальный заказ
          const currentOrder = loadOrderFromStorage();
          const currentSelectedDishes = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
          };
          
          Object.keys(currentOrder).forEach(cat => {
            const dishId = currentOrder[cat];
            if (dishId) {
              const dishItem = dishes.find(d => d.id === dishId);
              if (dishItem) {
                currentSelectedDishes[cat] = dishItem;
              }
            }
          });
          
          selectDish(dish, currentSelectedDishes);
        });
        
        card.addEventListener('click', (e) => {
          if (!e.target.closest('button')) {
            const currentOrder = loadOrderFromStorage();
            const currentSelectedDishes = {
              soup: null,
              main: null,
              salad: null,
              drink: null,
              dessert: null
            };
            
            Object.keys(currentOrder).forEach(cat => {
              const dishId = currentOrder[cat];
              if (dishId) {
                const dishItem = dishes.find(d => d.id === dishId);
                if (dishItem) {
                  currentSelectedDishes[cat] = dishItem;
                }
              }
            });
            
            selectDish(dish, currentSelectedDishes);
          }
        });
        
        grid.appendChild(card);
      });
    });
  });
}

// Выбор блюда
function selectDish(dish, selectedDishes) {
  console.log('Выбрано блюдо:', dish);
  
  // Сохраняем в localStorage
  saveSelectedDish(dish);
  
  // Обновляем selectedDishes
  selectedDishes[dish.category] = dish;
  
  // Обновляем отображение в текущей категории
  const section = document.querySelector(`[data-category="${dish.category}"]`);
  if (section) {
    const grid = section.querySelector('[data-grid]');
    if (grid) {
      grid.querySelectorAll('.dish-card').forEach(card => {
        const cardId = parseInt(card.dataset.id, 10); // Получаем id из data-атрибута
        const isSelected = cardId === dish.id;
        
        card.classList.toggle('selected', isSelected);
        
        const btn = card.querySelector('.add-btn');
        if (btn) {
          if (isSelected) {
            btn.textContent = 'Выбрано!';
            btn.disabled = true;
            btn.classList.add('selected');
          } else {
            btn.textContent = 'Добавить';
            btn.disabled = false;
            btn.classList.remove('selected');
          }
        }
      });
    }
  }
  
  // Обновляем панель заказа
  updateOrderPanel(selectedDishes);
}

// Создаем панель заказа
function createOrderPanel(selectedDishes) {
  // Удаляем старую панель, если есть
  const oldPanel = document.querySelector('.go-to-order-panel');
  if (oldPanel) oldPanel.remove();
  
  // Создаем новую панель
  const panel = document.createElement('div');
  panel.className = 'go-to-order-panel';
  
  // Рассчитываем общую стоимость
  const total = calculateTotal(selectedDishes);
  const order = loadOrderFromStorage();
  const isValid = isValidCombo(order);
  
  panel.innerHTML = `
    <div class="panel-order-info">
      <h3>Ваш заказ</h3>
      <div class="panel-total-price">${formatPrice(total)}</div>
    </div>
    <a href="checkout.html" class="go-to-checkout-btn" ${!isValid ? 'disabled' : ''}>
      Перейти к оформлению
    </a>
  `;
  
  // Вставляем перед футером
  const footer = document.querySelector('footer');
  if (footer) {
    footer.parentNode.insertBefore(panel, footer);
  }
  
  // Настраиваем состояние панели
  updateOrderPanel(selectedDishes);
}

// Обновляем панель заказа
function updateOrderPanel(selectedDishes) {
  const panel = document.querySelector('.go-to-order-panel');
  if (!panel) return;
  
  const total = calculateTotal(selectedDishes);
  const order = loadOrderFromStorage();
  const isValid = isValidCombo(order);
  const hasSelection = Object.values(order).some(v => v !== null);
  
  // Обновляем общую стоимость
  const totalElement = panel.querySelector('.panel-total-price');
  if (totalElement) {
    totalElement.textContent = formatPrice(total);
  }
  
  // Обновляем состояние кнопки
  const button = panel.querySelector('.go-to-checkout-btn');
  if (button) {
    if (isValid && hasSelection) {
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
    } else {
      button.disabled = true;
      button.style.opacity = '0.6';
      button.style.cursor = 'not-allowed';
    }
  }
  
  // Показываем/скрываем панель
  if (hasSelection) {
    panel.classList.remove('hidden');
  } else {
    panel.classList.add('hidden');
  }
}

// Рассчитываем общую стоимость
function calculateTotal(selectedDishes) {
  return Object.values(selectedDishes).reduce((sum, dish) => {
    return sum + (dish ? dish.price : 0);
  }, 0);
}

// Инициализируем страницу при загрузке
document.addEventListener('DOMContentLoaded', () => {
  // Если блюда уже загружены, инициализируем сразу
  if (dishesLoaded) {
    initializeLunchPage();
  } else {
    // Иначе ждем события загрузки
    document.addEventListener('dishesLoaded', initializeLunchPage);
  }
});
