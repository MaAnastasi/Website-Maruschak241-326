// orders.js

const API_KEY = "cf9287df-c4f7-4c52-9b77-12f551818caf";
const ORDERS_API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/orders";
const DISHES_API_URL = "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes";

let allOrders = [];
let allDishes = [];
let currentOrderId = null;

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Форматирование цены
const priceFormatter = new Intl.NumberFormat("ru-RU");
const formatPrice = (value) => `${priceFormatter.format(value)}₽`;

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Загрузка всех блюд
async function loadAllDishes() {
    try {
        const url = `${DISHES_API_URL}?api_key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        allDishes = await response.json();
        return allDishes;
    } catch (error) {
        console.error('Ошибка при загрузке блюд:', error);
        return [];
    }
}

// Загрузка заказов
async function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    
    try {
        const url = `${ORDERS_API_URL}?api_key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 401) {
                showNotification('Для просмотра заказов необходимо авторизоваться', 'error');
                ordersList.innerHTML = `
                    <div class="error-message">
                        <p>Для просмотра заказов необходимо авторизоваться.</p>
                        <p>Пожалуйста, убедитесь, что у вас установлен правильный API ключ.</p>
                    </div>
                `;
                return;
            }
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        allOrders = await response.json();
        
        // Сортировка по дате (новые первыми)
        allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        if (allOrders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-orders-message">
                    <p>У вас пока нет заказов.</p>
                    <p>Сделайте ваш первый заказ на странице <a href="checkout.html">оформления заказа</a>.</p>
                </div>
            `;
            return;
        }
        
        renderOrders(allOrders);
        
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        ordersList.innerHTML = `
            <div class="error-message">
                <p>Ошибка при загрузке заказов: ${error.message}</p>
                <button onclick="loadOrders()">Повторить попытку</button>
            </div>
        `;
    }
}

// Получение названий блюд по их ID
function getDishNames(order) {
    const dishNames = [];
    
    if (order.soup_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.soup_id);
        if (dish) dishNames.push(dish.name);
    }
    
    if (order.main_course_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.main_course_id);
        if (dish) dishNames.push(dish.name);
    }
    
    if (order.salad_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.salad_id);
        if (dish) dishNames.push(dish.name);
    }
    
    if (order.drink_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.drink_id);
        if (dish) dishNames.push(dish.name);
    }
    
    if (order.dessert_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.dessert_id);
        if (dish) dishNames.push(dish.name);
    }
    
    return dishNames.join(', ');
}

// Расчет стоимости заказа
function calculateOrderTotal(order) {
    let total = 0;
    
    if (order.soup_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.soup_id);
        if (dish) total += dish.price;
    }
    
    if (order.main_course_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.main_course_id);
        if (dish) total += dish.price;
    }
    
    if (order.salad_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.salad_id);
        if (dish) total += dish.price;
    }
    
    if (order.drink_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.drink_id);
        if (dish) total += dish.price;
    }
    
    if (order.dessert_id && allDishes.length > 0) {
        const dish = allDishes.find(d => d.id === order.dessert_id);
        if (dish) total += dish.price;
    }
    
    return total;
}

// Отображение заказов
function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    ordersList.innerHTML = orders.map((order, index) => {
        const dishNames = getDishNames(order);
        const total = calculateOrderTotal(order);
        const deliveryTime = order.delivery_type === 'by_time' && order.delivery_time 
            ? order.delivery_time 
            : 'Как можно скорее (с 7:00 до 23:00)';
        
        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-number">${index + 1}</div>
                    <div class="order-date">${formatDate(order.created_at)}</div>
                </div>
                
                <div class="order-content">
                    <div class="order-dishes">
                        <strong>Состав заказа:</strong> ${dishNames || 'Нет информации о блюдах'}
                    </div>
                    
                    <div class="order-info">
                        <div class="order-info-item">
                            <span class="order-info-label">Стоимость:</span>
                            <span class="order-info-value price">${formatPrice(total)}</span>
                        </div>
                        <div class="order-info-item">
                            <span class="order-info-label">Время доставки:</span>
                            <span class="order-info-value ${order.delivery_type === 'by_time' ? 'time' : 'asap'}">
                                ${deliveryTime}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="order-actions">
                    <button class="order-action-btn details" onclick="showOrderDetails(${order.id})">
                        <i class="bi bi-info-circle"></i> Подробнее
                    </button>
                    <button class="order-action-btn edit" onclick="showEditOrderModal(${order.id})">
                        <i class="bi bi-pencil"></i> Редактировать
                    </button>
                    <button class="order-action-btn delete" onclick="showDeleteOrderModal(${order.id})">
                        <i class="bi bi-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Показать детали заказа
function showOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrderId = orderId;
    
    const dishNames = getDishNames(order);
    const total = calculateOrderTotal(order);
    const deliveryTime = order.delivery_type === 'by_time' && order.delivery_time 
        ? order.delivery_time 
        : 'Как можно скорее (с 7:00 до 23:00)';
    
    const modal = document.getElementById('order-details-modal');
    const orderNumber = document.getElementById('order-number');
    const content = document.getElementById('order-details-content');
    
    orderNumber.textContent = `#${order.id}`;
    
    content.innerHTML = `
        <div class="order-detail-group">
            <h4>Информация о заказе</h4>
            <div class="detail-row">
                <span class="detail-label">Номер заказа:</span>
                <span class="detail-value">${order.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Дата оформления:</span>
                <span class="detail-value">${formatDate(order.created_at)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Статус:</span>
                <span class="detail-value">В обработке</span>
            </div>
        </div>
        
        <div class="order-detail-group">
            <h4>Состав заказа</h4>
            <div class="detail-row">
                <span class="detail-label">Блюда:</span>
                <span class="detail-value dishes">${dishNames || 'Нет информации о блюдах'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Общая стоимость:</span>
                <span class="detail-value price">${formatPrice(total)}</span>
            </div>
        </div>
        
        <div class="order-detail-group">
            <h4>Информация о доставке</h4>
            <div class="detail-row">
                <span class="detail-label">Тип доставки:</span>
                <span class="detail-value">${order.delivery_type === 'by_time' ? 'Ко времени' : 'Как можно скорее'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Время доставки:</span>
                <span class="detail-value">${deliveryTime}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Адрес доставки:</span>
                <span class="detail-value">${order.delivery_address}</span>
            </div>
        </div>
        
        <div class="order-detail-group">
            <h4>Контактная информация</h4>
            <div class="detail-row">
                <span class="detail-label">Имя:</span>
                <span class="detail-value">${order.full_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${order.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Телефон:</span>
                <span class="detail-value">${order.phone}</span>
            </div>
        </div>
        
        ${order.comment ? `
        <div class="order-detail-group">
            <h4>Комментарий</h4>
            <div class="detail-row">
                <span class="detail-value">${order.comment}</span>
            </div>
        </div>
        ` : ''}
    `;
    
    modal.classList.remove('hidden');
}

// Показать модальное окно редактирования
function showEditOrderModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrderId = orderId;
    
    const modal = document.getElementById('edit-order-modal');
    const orderNumber = document.getElementById('edit-order-number');
    const form = document.getElementById('edit-order-form');
    
    orderNumber.textContent = `#${order.id}`;
    
    // Заполняем форму значениями заказа
    document.getElementById('edit-full_name').value = order.full_name;
    document.getElementById('edit-email').value = order.email;
    document.getElementById('edit-phone').value = order.phone;
    document.getElementById('edit-delivery_address').value = order.delivery_address;
    document.getElementById('edit-comment').value = order.comment || '';
    document.getElementById('edit-subscribe').checked = order.subscribe || false;
    
    // Настраиваем тип доставки
    if (order.delivery_type === 'by_time') {
        document.getElementById('edit-delivery_by_time').checked = true;
        document.getElementById('edit-delivery_time').value = order.delivery_time || '';
        document.getElementById('edit-delivery_time').disabled = false;
    } else {
        document.getElementById('edit-delivery_asap').checked = true;
        document.getElementById('edit-delivery_time').value = '';
        document.getElementById('edit-delivery_time').disabled = true;
    }
    
    modal.classList.remove('hidden');
}

// Показать модальное окно подтверждения удаления
function showDeleteOrderModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrderId = orderId;
    
    const modal = document.getElementById('delete-order-modal');
    const orderNumber = document.getElementById('delete-order-number');
    
    orderNumber.textContent = `#${order.id}`;
    modal.classList.remove('hidden');
}

// Закрыть модальное окно
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
    currentOrderId = null;
}

// Редактирование заказа
async function editOrder(formData) {
    try {
        const url = `${ORDERS_API_URL}/${currentOrderId}?api_key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
        }
        
        const updatedOrder = await response.json();
        
        // Обновляем заказ в списке
        const index = allOrders.findIndex(o => o.id === currentOrderId);
        if (index !== -1) {
            allOrders[index] = { ...allOrders[index], ...updatedOrder };
        }
        
        showNotification('Заказ успешно изменён', 'success');
        renderOrders(allOrders);
        closeModal('edit-order-modal');
        
    } catch (error) {
        console.error('Ошибка при редактировании заказа:', error);
        showNotification(`Ошибка: ${error.message}`, 'error');
    }
}

// Удаление заказа
async function deleteOrder() {
    try {
        const url = `${ORDERS_API_URL}/${currentOrderId}?api_key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
        }
        
        // Удаляем заказ из списка
        allOrders = allOrders.filter(o => o.id !== currentOrderId);
        
        showNotification('Заказ успешно удалён', 'success');
        renderOrders(allOrders);
        closeModal('delete-order-modal');
        
    } catch (error) {
        console.error('Ошибка при удалении заказа:', error);
        showNotification(`Ошибка: ${error.message}`, 'error');
    }
}

// Инициализация страницы
async function initializeOrdersPage() {
    // Загружаем блюда
    await loadAllDishes();
    
    // Загружаем заказы
    await loadOrders();
    
    // Настраиваем обработчики событий для модальных окон
    setupModalEventListeners();
    
    // Настраиваем обработчики для кнопок закрытия
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Обработчик кнопки OK в деталях заказа
    const btnOk = document.querySelector('#order-details-modal .btn-ok');
    if (btnOk) {
        btnOk.addEventListener('click', () => {
            closeModal('order-details-modal');
        });
    }
    
    // Обработчик кнопки Отмена в редактировании
    const btnCancelEdit = document.querySelector('#edit-order-modal .btn-cancel');
    if (btnCancelEdit) {
        btnCancelEdit.addEventListener('click', () => {
            closeModal('edit-order-modal');
        });
    }
    
    // Обработчик кнопки Отмена в удалении
    const btnCancelDelete = document.querySelector('#delete-order-modal .btn-cancel');
    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', () => {
            closeModal('delete-order-modal');
        });
    }
    
    // Обработчик подтверждения удаления
    const btnConfirmDelete = document.querySelector('#delete-order-modal .btn-confirm-delete');
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', deleteOrder);
    }
    
    // Обработчик формы редактирования
    const editForm = document.getElementById('edit-order-form');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                full_name: document.getElementById('edit-full_name').value,
                email: document.getElementById('edit-email').value,
                phone: document.getElementById('edit-phone').value,
                delivery_address: document.getElementById('edit-delivery_address').value,
                delivery_type: document.querySelector('input[name="delivery_type"]:checked').value,
                comment: document.getElementById('edit-comment').value,
                subscribe: document.getElementById('edit-subscribe').checked
            };
            
            if (formData.delivery_type === 'by_time') {
                const deliveryTime = document.getElementById('edit-delivery_time').value;
                if (!deliveryTime) {
                    showNotification('Пожалуйста, укажите время доставки', 'error');
                    return;
                }
                formData.delivery_time = deliveryTime;
            }
            
            await editOrder(formData);
        });
    }
    
    // Настраиваем переключение типа доставки в форме редактирования
    const deliveryTypeRadios = document.querySelectorAll('input[name="delivery_type"]');
    deliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const deliveryTimeInput = document.getElementById('edit-delivery_time');
            if (this.value === 'by_time') {
                deliveryTimeInput.disabled = false;
                deliveryTimeInput.required = true;
            } else {
                deliveryTimeInput.disabled = true;
                deliveryTimeInput.required = false;
                deliveryTimeInput.value = '';
            }
        });
    });
    
    // Закрытие модальных окон по клику вне окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });
}

function setupModalEventListeners() {
    // Глобальные функции для onclick
    window.showOrderDetails = showOrderDetails;
    window.showEditOrderModal = showEditOrderModal;
    window.showDeleteOrderModal = showDeleteOrderModal;
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeOrdersPage);