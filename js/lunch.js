// Форматирование цены в русский формат
const priceFormatter = new Intl.NumberFormat("ru-RU");

const formatPrice = (value) => `${priceFormatter.format(value)}₽`;

// Функция для сообщений "не выбрано"
const getEmptyMessage = (category) =>
  category === "drink" ? "Напиток не выбран" : "Блюдо не выбрано";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Определяем категории
  const categoryKeys = ["soup", "main", "drink"];
  // 2. Проверяем наличие данных о блюдах
  const availableDishes = Array.isArray(dishes) ? dishes : [];
  // 3. Состояние выбора пользователя
  const selectionState = {
    soup: null,
    main: null,
    drink: null,
  };

  const hiddenFields = {
    soup: document.getElementById("selected-soup"),
    main: document.getElementById("selected-main"),
    drink: document.getElementById("selected-drink"),
  };

  const orderPlaceholder = document.querySelector(".order-placeholder");
  const orderDetails = document.querySelector(".order-details");
  const totalPrice = document.querySelector(".total-price");
  const orderForm = document.getElementById("order-form");

  categoryKeys.forEach((category) => {
    // Находим контейнер для этой категории
    const grid = document.querySelector(`[data-grid="${category}"]`);
    if (!grid) return;

    // Фильтруем блюда по категории и сортируем по имени
    const categoryDishes = availableDishes
      .filter((dish) => dish.category === category)
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));

    // Для каждого блюда создаем карточку
    categoryDishes.forEach((dish) => {
      const card = document.createElement("article");
      card.className = "dish-card";
      card.dataset.dish = dish.keyword;
      // Заполняем HTML содержимое карточки
      card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}" />
        <p class="price">${formatPrice(dish.price)}</p>
        <p class="name">${dish.name}</p>
        <p class="weight">${dish.count}</p>
        <button type="button" class="add-btn">Добавить</button>
      `;
      // Добавляем обработчик клика на кнопку
      const btn = card.querySelector(".add-btn");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectDish(dish);
      });

      grid.appendChild(card);
    });
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
          }
        });
      }
    });
  }

  function renderOrderState() {
    // 1. Проверяем, есть ли хоть один выбранный элемен
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

  renderOrderState();

  const timeAsap = document.getElementById("time_asap");
  const timeSpecific = document.getElementById("time_specific");
  const specificTime = document.getElementById("specific_time");
  
  // 2. Логика для выбора времени доставки
  const updateTimeVisibility = () => {
    if (!specificTime) return;
    if (timeAsap && timeAsap.checked) {
      specificTime.style.display = "none";
    } else if (timeSpecific && timeSpecific.checked) {
      specificTime.style.display = "inline-block";
    } else {
      specificTime.style.display = "none";
    }
  };
// Вешаем обработчики на радиокнопки
  timeAsap?.addEventListener("change", updateTimeVisibility);
  timeSpecific?.addEventListener("change", updateTimeVisibility);
  updateTimeVisibility();
});
