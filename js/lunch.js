// Форматирование цены в русский формат
const priceFormatter = new Intl.NumberFormat("ru-RU");

const formatPrice = (value) => `${priceFormatter.format(value)}₽`;

// Функция для сообщений "не выбрано"
const getEmptyMessage = (category) => {
  const messages = {
    drink: "Напиток не выбран",
    dessert: "Десерт не выбран",
    salad: "Салат не выбран",
    default: "Блюдо не выбрано"
  };
  return messages[category] || messages.default;
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Определяем категории
  const categoryKeys = ["soup", "main", "salad", "drink", "dessert"];
  
  // 2. Проверяем наличие данных о блюдах
  const availableDishes = Array.isArray(dishes) ? dishes : [];
  
  // 3. Состояние выбора пользователя
  const selectionState = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null,
  };

  const hiddenFields = {
    soup: document.getElementById("selected-soup"),
    main: document.getElementById("selected-main"),
    salad: document.getElementById("selected-salad"),
    drink: document.getElementById("selected-drink"),
    dessert: document.getElementById("selected-dessert"),
  };

  const orderPlaceholder = document.querySelector(".order-placeholder");
  const orderDetails = document.querySelector(".order-details");
  const totalPrice = document.querySelector(".total-price");
  const orderForm = document.getElementById("order-form");

  // 4. Отображение блюд с поддержкой фильтрации
  categoryKeys.forEach((category) => {
    const section = document.querySelector(`[data-category="${category}"]`);
    if (!section) return;
    
    const grid = section.querySelector(`[data-grid="${category}"]`);
    const filtersContainer = section.querySelector(".filters");
    
    if (!grid) return;

    // Функция для отображения блюд с учетом фильтра
    const renderDishes = (filterKind = "all") => {
      // Очищаем сетку
      grid.innerHTML = "";
      
      // Фильтруем блюда по категории и фильтру
      let categoryDishes = availableDishes
        .filter((dish) => dish.category === category);
      
      // Применяем фильтр, если выбран не "all"
      if (filterKind !== "all") {
        categoryDishes = categoryDishes.filter((dish) => dish.kind === filterKind);
      }
      
      // Сортируем по имени
      categoryDishes.sort((a, b) => a.name.localeCompare(b.name, "ru"));

      // Для каждого блюда создаем карточку
      categoryDishes.forEach((dish) => {
        const card = document.createElement("article");
        card.className = "dish-card";
        card.dataset.dish = dish.keyword;
        card.dataset.kind = dish.kind;
        
        // Проверяем, выбрано ли это блюдо
        const isSelected = selectionState[category]?.keyword === dish.keyword;
        
        // Заполняем HTML содержимое карточки
        card.innerHTML = `
          <img src="${dish.image}" alt="${dish.name}" />
          <p class="price">${formatPrice(dish.price)}</p>
          <p class="name">${dish.name}</p>
          <p class="weight">${dish.count}</p>
          <button type="button" class="${isSelected ? 'add-btn selected' : 'add-btn'}" ${isSelected ? 'disabled' : ''}>
            ${isSelected ? 'Выбрано!' : 'Добавить'}
          </button>
        `;
        
        if (isSelected) {
          card.classList.add("selected");
        }
        
        // Добавляем обработчик клика на кнопку
        const btn = card.querySelector(".add-btn");
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          selectDish(dish);
        });

                // Добавляем обработчик клика на всю карточку
        card.addEventListener("click", (e) => {
          if (e.target.tagName !== 'BUTTON') {
            selectDish(dish);
          }
        });

        grid.appendChild(card);
      });
    };

    // Инициализируем отображение всех блюд
    renderDishes("all");

    // Обработчики для фильтров
    if (filtersContainer) {
      const filterButtons = filtersContainer.querySelectorAll(".filter-btn");
      
      filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          // Снимаем активный класс со всех кнопок
          filterButtons.forEach(b => b.classList.remove("active"));
          
          // Если кликнули на уже активную кнопку "Все", снимаем фильтр
          if (btn.dataset.kind === "all" && btn.classList.contains("active")) {
            btn.classList.remove("active");
            renderDishes("all");
          } else {
            // Активируем нажатую кнопку
            btn.classList.add("active");
            renderDishes(btn.dataset.kind);
          }
        });
      });
    }
  });

  function selectDish(dish) {
    // 1. Сохраняем выбор в состоянии
    selectionState[dish.category] = dish;
    
    // 2. Заполняем скрытое поле формы
    if (hiddenFields[dish.category]) {
      hiddenFields[dish.category].value = dish.keyword;
    }
    
    // 3. Находим контейнер сетки для этой категории
    const grid = document.querySelector(`[data-grid="${dish.category}"]`);
    if (grid) {
      // 3.1. Сбрасываем все карточки в категории
      grid.querySelectorAll(".dish-card").forEach((card) => {
        card.classList.remove("selected");
        const btn = card.querySelector(".add-btn");
        if (btn) {
          btn.textContent = "Добавить";
          btn.disabled = false;
          btn.classList.remove("selected");
        }
      });
      
      // 3.2. Выделяем выбранную карточку
      const selectedCard = grid.querySelector(`[data-dish="${dish.keyword}"]`);
      if (selectedCard) {
        selectedCard.classList.add("selected");
        const btn = selectedCard.querySelector(".add-btn");
        if (btn) {
          btn.textContent = "Выбрано!";
          btn.disabled = true;
          btn.classList.add("selected");
        }
      }
    }
    
    // 4. Обновляем отображение заказа
    renderOrderState();
  }

  function resetSelections() {
    categoryKeys.forEach((category) => {
      // 1. Очищаем состояние
      selectionState[category] = null;
      
      // 2. Очищаем скрытые поля
      if (hiddenFields[category]) {
        hiddenFields[category].value = "";
      }
      
      // 3. Сбрасываем визуальное состояние карточек
      const grid = document.querySelector(`[data-grid="${category}"]`);
      if (grid) {
        grid.querySelectorAll(".dish-card").forEach((card) => {
          card.classList.remove("selected");
          const btn = card.querySelector(".add-btn");
          if (btn) {
            btn.textContent = "Добавить";
            btn.disabled = false;
            btn.classList.remove("selected");
          }
        });
      }
      
      // 4. Сбрасываем фильтры
      const section = document.querySelector(`[data-category="${category}"]`);
      if (section) {
        const filterButtons = section.querySelectorAll(".filter-btn");
        filterButtons.forEach(btn => {
          btn.classList.remove("active");
        });
        // Активируем кнопку "Все"
        const allBtn = section.querySelector('[data-kind="all"]');
        if (allBtn) allBtn.classList.add("active");
      }
    });
    
    // 5. Перерисовываем все блюда
    categoryKeys.forEach((category) => {
      const section = document.querySelector(`[data-category="${category}"]`);
      if (section) {
        const grid = section.querySelector(`[data-grid="${category}"]`);
        if (grid) {
          // Фильтруем блюда по категории и сортируем
          let categoryDishes = availableDishes
            .filter((dish) => dish.category === category)
            .sort((a, b) => a.name.localeCompare(b.name, "ru"));
          
          // Очищаем и перерисовываем
          grid.innerHTML = "";
          categoryDishes.forEach((dish) => {
            const card = document.createElement("article");
            card.className = "dish-card";
            card.dataset.dish = dish.keyword;
            card.dataset.kind = dish.kind;
            
            card.innerHTML = `
              <img src="${dish.image}" alt="${dish.name}" />
              <p class="price">${formatPrice(dish.price)}</p>
              <p class="name">${dish.name}</p>
              <p class="weight">${dish.count}</p>
              <button type="button" class="add-btn">Добавить</button>
            `;
            
            const btn = card.querySelector(".add-btn");
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              selectDish(dish);
            });
            
            grid.appendChild(card);
          });
        }
      }
    });
  }

  function renderOrderState() {
    // 1. Проверяем, есть ли хоть один выбранный элемент
    const selectedAny = categoryKeys.some((category) =>
      Boolean(selectionState[category]),
    );
    
    // 2. Показываем/скрываем блоки в зависимости от выбора
    if (orderPlaceholder && orderDetails) {
      if (selectedAny) {
        orderPlaceholder.classList.add("hidden");
        orderDetails.classList.remove("hidden");
      } else {
        orderPlaceholder.classList.remove("hidden");
        orderDetails.classList.add("hidden");
      }
    }
    
    // 3. Обновляем отображение для каждой категории
    categoryKeys.forEach((category) => {
      const selectionNode = document.querySelector(
        `[data-order-category="${category}"] .order-selection`,
      );
      if (!selectionNode) return;
      
      const dish = selectionState[category];
      if (dish) {
        // Если блюдо выбрано - показываем название и цену
        selectionNode.innerHTML = `
          <span class="order-selection-name">${dish.name}</span>
          <span class="order-selection-price">${formatPrice(dish.price)}</span>
        `;
      } else {
        // Если не выбрано - показываем сообщение
        selectionNode.innerHTML = `<span class="order-selection-empty">${getEmptyMessage(
          category,
        )}</span>`;
      }
    });
    
    // 4. Пересчитываем и показываем общую сумму
    if (totalPrice) {
      const total = categoryKeys.reduce((sum, category) => {
        const dish = selectionState[category];
        return sum + (dish ? dish.price : 0);
      }, 0);
      totalPrice.textContent = formatPrice(total);
    }
  }

  // 1. Обработчик сброса формы
  if (orderForm) {
    orderForm.addEventListener("reset", () => {
      resetSelections();
      renderOrderState();
    });
  }

  // Инициализируем отображение заказа
  renderOrderState();

  // 2. Логика для выбора времени доставки
  const timeAsap = document.getElementById("time_asap");
  const timeSpecific = document.getElementById("time_specific");
  const specificTime = document.getElementById("specific_time");
  
  const updateTimeVisibility = () => {
    if (!specificTime) return;
    if (timeAsap && timeAsap.checked) {
      specificTime.style.display = "none";
      specificTime.required = false;
    } else if (timeSpecific && timeSpecific.checked) {
      specificTime.style.display = "inline-block";
      specificTime.required = true;
    } else {
      specificTime.style.display = "none";
      specificTime.required = false;
    }
  };

  // Вешаем обработчики на радиокнопки
  timeAsap?.addEventListener("change", updateTimeVisibility);
  timeSpecific?.addEventListener("change", updateTimeVisibility);
  
  // Инициализируем видимость времени
  updateTimeVisibility();
});