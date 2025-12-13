const priceFormatter = new Intl.NumberFormat("ru-RU");

const formatPrice = (value) => `${priceFormatter.format(value)}₽`;

const getEmptyMessage = (category) => {
  const messages = {
    drink: "Напиток не выбран",
    dessert: "Десерт не выбран",
    salad: "Салат не выбран",
    default: "Блюдо не выбрано",
  };
  return messages[category] || messages.default;
};

// Глобальная функция для инициализации приложения после загрузки данных
function initializeApp() {
  const categoryKeys = ["soup", "main", "salad", "drink", "dessert"];

  const availableDishes = Array.isArray(dishes) ? dishes : [];

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

  // Обновляем специальное комбо с актуальными данными
  updateSpecialCombo(availableDishes);

  categoryKeys.forEach((category) => {
    const section = document.querySelector(`[data-category="${category}"]`);
    if (!section) return;

    const grid = section.querySelector(`[data-grid="${category}"]`);
    const filtersContainer = section.querySelector(".filters");

    if (!grid) return;

    const renderDishes = (filterKind = "all") => {
      grid.innerHTML = "";

      let categoryDishes = availableDishes.filter(
        (dish) => dish.category === category,
      );

      if (filterKind !== "all") {
        categoryDishes = categoryDishes.filter(
          (dish) => dish.kind === filterKind,
        );
      }

      categoryDishes.sort((a, b) => a.name.localeCompare(b.name, "ru"));

      if (categoryDishes.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 2rem;">Нет доступных блюд в этой категории</p>`;
        return;
      }

      categoryDishes.forEach((dish) => {
        const card = document.createElement("article");
        card.className = "dish-card";
        card.dataset.dish = dish.keyword;
        card.dataset.kind = dish.kind;

        const isSelected = selectionState[category]?.keyword === dish.keyword;

        card.innerHTML = `
          <img src="${dish.image}" alt="${dish.name}" />
          <p class="price">${formatPrice(dish.price)}</p>
          <p class="name">${dish.name}</p>
          <p class="weight">${dish.count}</p>
          <button type="button" class="${isSelected ? "add-btn selected" : "add-btn"}" ${isSelected ? "disabled" : ""}>
            ${isSelected ? "Выбрано!" : "Добавить"}
          </button>
        `;

        if (isSelected) {
          card.classList.add("selected");
        }

        const btn = card.querySelector(".add-btn");
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          selectDish(dish);
        });

        card.addEventListener("click", (e) => {
          if (e.target.tagName !== "BUTTON") {
            selectDish(dish);
          }
        });

        grid.appendChild(card);
      });
    };

    renderDishes("all");

    if (filtersContainer) {
      const filterButtons = filtersContainer.querySelectorAll(".filter-btn");

      filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          filterButtons.forEach((b) => b.classList.remove("active"));

          if (btn.dataset.kind === "all" && btn.classList.contains("active")) {
            btn.classList.remove("active");
            renderDishes("all");
          } else {
            btn.classList.add("active");
            renderDishes(btn.dataset.kind);
          }
        });
      });
    }
  });

  function selectDish(dish) {
    selectionState[dish.category] = dish;

    if (hiddenFields[dish.category]) {
      hiddenFields[dish.category].value = dish.keyword;
    }

    const grid = document.querySelector(`[data-grid="${dish.category}"]`);
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

    renderOrderState();
  }

  function resetSelections() {
    categoryKeys.forEach((category) => {
      selectionState[category] = null;

      if (hiddenFields[category]) {
        hiddenFields[category].value = "";
      }

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

      const section = document.querySelector(`[data-category="${category}"]`);
      if (section) {
        const filterButtons = section.querySelectorAll(".filter-btn");
        filterButtons.forEach((btn) => {
          btn.classList.remove("active");
        });
        const allBtn = section.querySelector('[data-kind="all"]');
        if (allBtn) allBtn.classList.add("active");
      }
    });

    categoryKeys.forEach((category) => {
      const section = document.querySelector(`[data-category="${category}"]`);
      if (section) {
        const grid = section.querySelector(`[data-grid="${category}"]`);
        if (grid) {
          let categoryDishes = availableDishes
            .filter((dish) => dish.category === category)
            .sort((a, b) => a.name.localeCompare(b.name, "ru"));

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
    const selectedAny = categoryKeys.some((category) =>
      Boolean(selectionState[category]),
    );

    if (orderPlaceholder && orderDetails) {
      if (selectedAny) {
        orderPlaceholder.classList.add("hidden");
        orderDetails.classList.remove("hidden");
      } else {
        orderPlaceholder.classList.remove("hidden");
        orderDetails.classList.add("hidden");
      }
    }

    categoryKeys.forEach((category) => {
      const selectionNode = document.querySelector(
        `[data-order-category="${category}"] .order-selection`,
      );
      if (!selectionNode) return;

      const dish = selectionState[category];
      if (dish) {
        selectionNode.innerHTML = `
          <span class="order-selection-name">${dish.name}</span>
          <span class="order-selection-price">${formatPrice(dish.price)}</span>
        `;
      } else {
        selectionNode.innerHTML = `<span class="order-selection-empty">${getEmptyMessage(
          category,
        )}</span>`;
      }
    });

    if (totalPrice) {
      const total = categoryKeys.reduce((sum, category) => {
        const dish = selectionState[category];
        return sum + (dish ? dish.price : 0);
      }, 0);
      totalPrice.textContent = formatPrice(total);
    }
  }

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

  timeAsap?.addEventListener("change", updateTimeVisibility);
  timeSpecific?.addEventListener("change", updateTimeVisibility);

  updateTimeVisibility();

  const validCombos = [
    new Set(["soup", "main", "salad", "drink"]),
    new Set(["soup", "main", "drink"]),
    new Set(["soup", "salad", "drink"]),
    new Set(["main", "salad", "drink"]),
    new Set(["main", "drink"]),
  ];

  const notificationData = {
    nothing: {
      msg: "Ничего не выбрано. Выберите блюда для заказа",
    },
    need_drink: {
      msg: "Выберите напиток",
    },
    need_main_or_salad: {
      msg: "Выберите главное блюдо или салат",
    },
    need_soup_or_main: {
      msg: "Выберите суп или главное блюдо",
    },
    need_main: {
      msg: "Выберите главное блюдо",
    },
  };

  function showNotification(type) {
    const data = notificationData[type];
    if (!data) return;

    const overlay = document.createElement("div");
    overlay.className = "notification-overlay";

    overlay.innerHTML = `
      <div class="notification-popup">
        <p>${data.msg}</p>
        <button class="ok-btn">Окей</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector(".ok-btn").addEventListener("click", () => {
      document.body.removeChild(overlay);
    });
  }

  orderForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const selectedCategories = new Set(
    Object.keys(selectionState).filter(
      (category) => selectionState[category] && category !== "dessert",
    ),
  );

  if (selectedCategories.size === 0 && !selectionState.dessert) {
    showNotification("nothing");
    return;
  }

  const isMatch = validCombos.some((combo) => {
    if (combo.size !== selectedCategories.size) return false;
    for (const item of combo) {
      if (!selectedCategories.has(item)) return false;
    }
    return true;
  });

  if (isMatch) {
    // Проверяем, выбрано ли специальное комбо
    const isSpecialCombo = 
      selectionState.soup?.keyword === "chicken" &&
      selectionState.main?.keyword === "lazanya" &&
      selectionState.drink?.keyword === "tea";
    
    if (isSpecialCombo) {
      // Добавляем скрытое поле со скидкой
      const discountField = document.createElement('input');
      discountField.type = 'hidden';
      discountField.name = 'special_combo_discount';
      discountField.value = '15%';
      this.appendChild(discountField);
      
      // Рассчитываем итоговую цену со скидкой
      const totalPriceElement = document.querySelector('.total-price');
      if (totalPriceElement) {
        const comboPrice = calculateComboPrice();
        totalPriceElement.textContent = `${comboPrice}₽`;
      }
    }
    
    this.submit();
  } else {
      const has = (cat) => selectedCategories.has(cat);
      const hasSoup = has("soup");
      const hasMain = has("main");
      const hasSalad = has("salad");
      const hasDrink = has("drink");
      const hasDessert = Boolean(selectionState.dessert);

      if (
        (hasSoup && hasMain && hasSalad && !hasDrink) ||
        (hasSoup && hasMain && !hasSalad && !hasDrink) ||
        (hasSoup && !hasMain && hasSalad && !hasDrink) ||
        (!hasSoup && hasMain && hasSalad && !hasDrink) ||
        (!hasSoup && hasMain && !hasSalad && !hasDrink)
      ) {
        showNotification("need_drink");
      } else if (hasSoup && !hasMain && !hasSalad) {
        showNotification("need_main_or_salad");
      } else if (!hasSoup && !hasMain && hasSalad) {
        showNotification("need_soup_or_main");
      } else if (
        (!hasSoup && !hasMain && !hasSalad && hasDrink) ||
        (!hasSoup && !hasMain && !hasSalad && hasDessert && !hasDrink)
      ) {
        showNotification("need_main");
      } else {
        showNotification("nothing");
      }
    }
  });
}

// Функция для расчета цены комбо со скидкой
function calculateComboPrice() {
  // Находим блюда в комбо (используем ключевые слова из API)
  const chickenSoup = dishes.find(dish => dish.keyword === "chicken");
  const lasagna = dishes.find(dish => dish.keyword === "lazanya");
  const blackTea = dishes.find(dish => dish.keyword === "tea");
  
  if (!chickenSoup || !lasagna || !blackTea) return 0;
  
  const totalPrice = chickenSoup.price + lasagna.price + blackTea.price;
  const discount = totalPrice * 0.15; // 15% скидка
  return Math.round(totalPrice - discount);
}

// Функция для обновления специального комбо
function updateSpecialCombo(availableDishes) {
  // Находим блюда для комбо
  const chickenSoup = availableDishes.find(dish => dish.keyword === "chicken");
  const lasagna = availableDishes.find(dish => dish.keyword === "lazanya");
  const blackTea = availableDishes.find(dish => dish.keyword === "tea");
  
  if (!chickenSoup || !lasagna || !blackTea) return;
  
  const comboPrice = calculateComboPrice();
  const totalPrice = chickenSoup.price + lasagna.price + blackTea.price;
  
  // Обновляем отображение цен комбо
  const oldPriceElement = document.querySelector('.old-price');
  const newPriceElement = document.querySelector('.new-price');
  const comboBadge = document.querySelector('.combo-badge');
  
  if (oldPriceElement && newPriceElement && comboBadge) {
    oldPriceElement.textContent = `${totalPrice}₽`;
    newPriceElement.textContent = `${comboPrice}₽`;
    comboBadge.textContent = `-15%`;
  }
  
  // Обновляем изображения в комбо-карточке
  const soupImage = document.querySelector('#special-combo .dish-icon:nth-child(1) img');
  const mainImage = document.querySelector('#special-combo .dish-icon:nth-child(2) img');
  const drinkImage = document.querySelector('#special-combo .dish-icon:nth-child(3) img');
  
  if (soupImage) soupImage.src = chickenSoup.image;
  if (mainImage) mainImage.src = lasagna.image;
  if (drinkImage) drinkImage.src = blackTea.image;
  
  // Обновляем названия
  const soupName = document.querySelector('#special-combo .dish-icon:nth-child(1) span');
  const mainName = document.querySelector('#special-combo .dish-icon:nth-child(2) span');
  const drinkName = document.querySelector('#special-combo .dish-icon:nth-child(3) span');
  
  if (soupName) soupName.textContent = chickenSoup.name;
  if (mainName) mainName.textContent = lasagna.name;
  if (drinkName) drinkName.textContent = blackTea.name;
  
  // Обработчик для кнопки выбора комбо
  const selectComboBtn = document.getElementById('select-special-combo');
  if (selectComboBtn) {
    selectComboBtn.addEventListener('click', () => {
      if (!chickenSoup || !lasagna || !blackTea) {
        alert("Ошибка: не удалось найти блюда из комбо");
        return;
      }
      
      // Выбираем все три блюда
      selectDish(chickenSoup);
      selectDish(lasagna);
      selectDish(blackTea);
      
      // Показываем уведомление о скидке
      const overlay = document.createElement("div");
      overlay.className = "notification-overlay";
      
      const comboPrice = calculateComboPrice();
      const totalPrice = chickenSoup.price + lasagna.price + blackTea.price;
      
      overlay.innerHTML = `
        <div class="notification-popup">
          <p>Вы выбрали специальное комбо!</p>
          <p>${chickenSoup.name} + ${lasagna.name} + ${blackTea.name}</p>
          <div style="margin: 15px 0; padding: 10px; background: #fffaf0; border-radius: 8px;">
            <div style="text-decoration: line-through; color: #999;">Итого: ${totalPrice}₽</div>
            <div style="font-size: 1.3rem; color: #e7490f; font-weight: bold;">Со скидкой: ${comboPrice}₽</div>
            <div style="color: #ff9800; font-weight: bold;">Экономия: ${totalPrice - comboPrice}₽</div>
          </div>
          <button class="ok-btn">Отлично!</button>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      overlay.querySelector(".ok-btn").addEventListener("click", () => {
        document.body.removeChild(overlay);
      });
      
      // Прокручиваем к форме заказа
      document.querySelector('.order-form-section').scrollIntoView({ 
        behavior: 'smooth' 
      });
    });
  }
}

// Если данные уже загружены, инициализируем приложение сразу
if (Array.isArray(dishes) && dishes.length > 0) {
  initializeApp();
}