// checkout.js - Обновленная версия

// Инициализация страницы оформления заказа
async function initializeCheckoutPage() {
    console.log('Инициализация страницы оформления заказа...');
    
    // Ждем загрузки блюд
    if (!dishesLoaded) {
        await new Promise(resolve => {
            document.addEventListener('dishesLoaded', resolve);
        });
    }
    
    // Загружаем заказ
    const order = loadOrderFromStorage();
    console.log('Заказ из localStorage:', order);
    
    // Получаем полные данные блюд
    const orderItems = {};
    let total = 0;
    
    Object.keys(order).forEach(category => {
        const dishId = order[category];
        if (dishId) {
            const dish = dishes.find(d => d.id === dishId);
            if (dish) {
                orderItems[category] = dish;
                total += dish.price;
            }
        }
    });
    
    console.log('Полные данные заказа:', orderItems);
    
    // Отображаем заказ в виде горизонтальных карточек
    renderOrderItemsHorizontal(orderItems);
    
    // Обновляем общую стоимость
    document.getElementById('checkout-total-price').textContent = formatPrice(total);
    
    // Настраиваем кнопку очистки
    const clearOrderBtn = document.getElementById('clear-order');
    if (clearOrderBtn) {
        clearOrderBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите очистить весь заказ?')) {
                clearOrder();
                location.reload();
            }
        });
    }
    
    // Настраиваем форму
    setupCheckoutForm(orderItems);
    
    // Настраиваем модальное окно
    setupModal();
}

// Отображаем элементы заказа в виде горизонтальных карточек
function renderOrderItemsHorizontal(orderItems) {
    const container = document.getElementById('order-items');
    if (!container) return;
    
    const emptyMessage = container.querySelector('.empty-order-message');
    
    const hasItems = Object.keys(orderItems).length > 0;
    
    if (!hasItems) {
        if (emptyMessage) {
            emptyMessage.style.display = 'block';
        } else {
            container.innerHTML = `
                <div class="empty-order-message">
                    <p>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lunch.html">Собрать ланч</a>.</p>
                </div>
            `;
        }
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    // Создаем контейнер для сетки карточек
    const gridContainer = document.createElement('div');
    gridContainer.className = 'order-items-grid';
    
    // Добавляем карточки заказа
    Object.entries(orderItems).forEach(([category, dish], index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'order-item-card';
        cardElement.style.animationDelay = `${index * 0.1}s`;
        
        // Определяем название категории для отображения
        const categoryNames = {
            'soup': 'Суп',
            'main': 'Главное блюдо',
            'salad': 'Салат/Стартер',
            'drink': 'Напиток',
            'dessert': 'Десерт'
        };
        
        cardElement.innerHTML = `
            <div class="order-item-card-header">
                <img src="${dish.image}" alt="${dish.name}" class="order-item-img" loading="lazy">
                <div class="order-item-main-info">
                    <div class="order-item-name">${dish.name}</div>
                    <div class="order-item-category" data-category="${category}">
                        ${categoryNames[category] || category}
                    </div>
                </div>
            </div>
            <div class="order-item-card-body">
                <div class="order-item-details">
                    <span class="order-item-weight">${dish.count}</span>
                    <span class="order-item-price">${formatPrice(dish.price)}</span>
                </div>
                <div class="order-item-description">
                    ${getDishDescription(dish)}
                </div>
            </div>
            <div class="order-item-card-footer">
                <button type="button" class="remove-item-btn" data-category="${category}">
                    Удалить из заказа
                </button>
            </div>
        `;
        
        // Обработчик удаления
        const removeBtn = cardElement.querySelector('.remove-item-btn');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            if (confirm(`Удалить "${dish.name}" из заказа?`)) {
                removeDishFromOrder(category);
                // Анимация удаления
                cardElement.style.animation = 'slideOut 0.3s ease';
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'translateX(-20px)';
                
                 setTimeout(() => {
                     cardElement.remove();
                     // Обновляем общую стоимость после удаления
                     const currentOrder = loadOrderFromStorage();
                     const newOrderItems = {};
                     let newTotal = 0;
                     Object.keys(currentOrder).forEach(cat => {
                         const dishId = currentOrder[cat];
                         if (dishId) {
                             const dishItem = dishes.find(d => d.id === dishId);
                             if (dishItem) {
                                 newOrderItems[cat] = dishItem;
                                 newTotal += dishItem.price;
                             }
                         }
                     });
                    document.getElementById('checkout-total-price').textContent = formatPrice(newTotal);
                    
                    // Если корзина пуста, показываем сообщение
                    if (Object.keys(newOrderItems).length === 0) {
                        renderOrderItemsHorizontal({});
                    }
                 }, 300);
            }
        });
        
        gridContainer.appendChild(cardElement);
    });
    
    // Очищаем контейнер и добавляем сетку
    container.innerHTML = '';
    container.appendChild(gridContainer);
    
    // Добавляем CSS для анимации удаления
    if (!document.querySelector('#remove-animation')) {
        const style = document.createElement('style');
        style.id = 'remove-animation';
        style.textContent = `
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Генерируем описание блюда
function getDishDescription(dish) {
    const descriptions = {
        'soup': 'Ароматный суп с насыщенным вкусом',
        'main': 'Основное блюдо для сытного обеда',
        'salad': 'Свежий и полезный салат',
        'drink': 'Освежающий напиток',
        'dessert': 'Сладкое завершение обеда'
    };
    
    return descriptions[dish.category] || 'Вкусное блюдо для вашего обеда';
}

// Настройка формы (остается без изменений, но обновлена для нового дизайна)
function setupCheckoutForm(orderItems) {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    
    const orderDetails = form.querySelector('.order-details');
    const orderPlaceholder = form.querySelector('.order-placeholder');
    const totalPriceElement = form.querySelector('.order-total .total-price');
    
    const hasItems = Object.keys(orderItems).length > 0;
    let total = 0;
    
    if (hasItems) {
        if (orderPlaceholder) orderPlaceholder.classList.add('hidden');
        if (orderDetails) orderDetails.classList.remove('hidden');
        
        // Заполняем данные в форме
        Object.entries(orderItems).forEach(([category, dish]) => {
            const selection = form.querySelector(`[data-order-category="${category}"] .order-selection`);
            if (selection) {
                selection.innerHTML = `
                    <span class="order-selection-name">${dish.name}</span>
                    <span class="order-selection-price">${formatPrice(dish.price)}</span>
                `;
            }
            total += dish.price;
            
            // Добавляем скрытые поля с ID блюд
            const inputName = category === 'main' ? 'main_course_id' : `${category}_id`;
            let input = form.querySelector(`[name="${inputName}"]`);
            
            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = inputName;
                form.appendChild(input);
            }
            
            input.value = dish.id;
        });
        
        // Обновляем общую стоимость в форме
        if (totalPriceElement) {
            totalPriceElement.textContent = formatPrice(total);
        }
    } else {
        if (orderPlaceholder) orderPlaceholder.classList.remove('hidden');
        if (orderDetails) orderDetails.classList.add('hidden');
        if (totalPriceElement) totalPriceElement.textContent = '0₽';
    }
    
    // Настраиваем время доставки
    const deliveryAsap = document.getElementById('delivery_asap');
    const deliveryByTime = document.getElementById('delivery_by_time');
    const deliveryTime = document.getElementById('delivery_time');
    
    if (deliveryAsap && deliveryByTime && deliveryTime) {
        function updateDeliveryTime() {
            if (deliveryAsap.checked) {
                deliveryTime.disabled = true;
                deliveryTime.required = false;
                deliveryTime.style.opacity = '0.5';
                deliveryTime.value = '';
            } else {
                deliveryTime.disabled = false;
                deliveryTime.required = true;
                deliveryTime.style.opacity = '1';
            }
        }
        
        deliveryAsap.addEventListener('change', updateDeliveryTime);
        deliveryByTime.addEventListener('change', updateDeliveryTime);
        updateDeliveryTime();
    }
    
    // Обработчик отправки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        if (!submitBtn) return;
        
        const originalText = submitBtn.textContent;
        
        // Проверяем, есть ли выбранные блюда
        const order = loadOrderFromStorage();
        const hasSelectedItems = Object.values(order).some(v => v !== null);
        
        if (!hasSelectedItems) {
            showModal('Ошибка', 'Выберите блюда для заказа на странице "Собрать ланч".');
            return;
        }
        
        // Проверяем валидность комбо
        if (!isValidCombo(order)) {
            showModal('Ошибка', 'Выберите одно из доступных комбо блюд для оформления заказа.');
            return;
        }
        
        // Собираем данные формы
        const formData = new FormData(form);
        const orderData = {
            full_name: formData.get('full_name') || '',
            email: formData.get('email') || '',
            subscribe: formData.get('subscribe') === 'on',
            phone: formData.get('phone') || '',
            delivery_address: formData.get('delivery_address') || '',
            delivery_type: formData.get('delivery_type') || 'asap',
            delivery_time: formData.get('delivery_time') || '',
            comment: formData.get('comment') || '',
            soup_id: form.querySelector('[name="soup_id"]')?.value || null,
            main_course_id: form.querySelector('[name="main_course_id"]')?.value || null,
            salad_id: form.querySelector('[name="salad_id"]')?.value || null,
            drink_id: form.querySelector('[name="drink_id"]')?.value || null,
            dessert_id: form.querySelector('[name="dessert_id"]')?.value || null
        };
        
        // Валидация обязательных полей
        if (!orderData.full_name.trim()) {
            showModal('Ошибка', 'Пожалуйста, введите ваше имя.');
            return;
        }
        
        if (!orderData.email.trim()) {
            showModal('Ошибка', 'Пожалуйста, введите ваш email.');
            return;
        }
        
        if (!orderData.phone.trim()) {
            showModal('Ошибка', 'Пожалуйста, введите ваш телефон.');
            return;
        }
        
        if (!orderData.delivery_address.trim()) {
            showModal('Ошибка', 'Пожалуйста, введите адрес доставки.');
            return;
        }
        
        // Дополнительная валидация времени доставки
        if (orderData.delivery_type === 'by_time' && !orderData.delivery_time) {
            showModal('Ошибка', 'Пожалуйста, укажите время доставки.');
            return;
        }
        
        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(orderData.email)) {
            showModal('Ошибка', 'Пожалуйста, введите корректный email адрес.');
            return;
        }
        
        // Валидация телефона (упрощенная)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(orderData.phone) || orderData.phone.replace(/\D/g, '').length < 10) {
            showModal('Ошибка', 'Пожалуйста, введите корректный номер телефона.');
            return;
        }
        
        // Меняем текст кнопки
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        try {
            // Отправляем заказ
            const result = await submitOrder(orderData);
            
            if (result.success) {
                // Очищаем заказ
                clearOrder();
                
                // Показываем красивое сообщение об успехе
                showModal(
                    '🎉 Заказ успешно оформлен!', 
                    `Спасибо за ваш заказ, ${orderData.full_name}!<br><br>
                    <strong>Номер заказа:</strong> #${result.data.id}<br>
                    <strong>Сумма заказа:</strong> ${formatPrice(total)}<br>
                    <strong>Статус:</strong> В обработке<br><br>
                    Мы свяжемся с вами в ближайшее время для подтверждения.`, 
                    true
                );
                
                // Очищаем форму
                form.reset();
                
                // Перезагружаем страницу через 5 секунд
                setTimeout(() => {
                    location.reload();
                }, 5000);
            } else {
                showModal('Ошибка', 'Не удалось оформить заказ: ' + result.error);
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            showModal('Ошибка', 'Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.');
            console.error('Ошибка при отправке заказа:', error);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Настройка модального окна (с улучшениями)
function setupModal() {
    const modal = document.getElementById('notification-modal');
    if (!modal) return;
    
    const okBtn = document.getElementById('modal-ok-btn');
    if (okBtn) {
        okBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
}

// Показ модального окна (улучшенная версия)
function showModal(title, message, isSuccess = false) {
    const modal = document.getElementById('notification-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    if (!modal || !modalTitle || !modalMessage) {
        // Если модальное окно не найдено, используем alert
        alert(`${title}\n${message}`);
        return;
    }
    
    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    
    // Устанавливаем стили в зависимости от типа сообщения
    if (isSuccess) {
        modalTitle.style.color = '#28a745';
        modal.querySelector('.ok-btn').style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    } else {
        modalTitle.style.color = '#dc3545';
        modal.querySelector('.ok-btn').style.background = 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)';
    }
    
    modal.classList.remove('hidden');
}

// Вспомогательная функция для форматирования цены
const priceFormatter = new Intl.NumberFormat("ru-RU");
const formatPrice = (value) => `${priceFormatter.format(value)}₽`;

// Запускаем инициализацию
document.addEventListener('DOMContentLoaded', initializeCheckoutPage);