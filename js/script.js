/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification ('success' or 'danger').
 */
function showNotification(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        console.error('Toast container not found!');
        return;
    }

    const toastId = 'toast-' + Math.random().toString(36).substr(2, 9);
    
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
            <div class="toast-header ${type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}">
                <strong class="me-auto">${type === 'success' ? 'Успех' : 'Ошибка'}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });

    toast.show();
}

document.addEventListener('DOMContentLoaded', () => {
    // State for courses
    let allCourses = [];
    let filteredCourses = [];
    let currentPage = 1;
    const coursesPerPage = 5;

    // DOM Elements for courses
    const coursesContainer = document.getElementById('courses-container');
    const paginationContainer = document.getElementById('courses-pagination');
    const searchInput = document.getElementById('course-name-input');
    const levelSelect = document.getElementById('course-level-select');

    /**
     * Renders courses for the current page.
     */
    function renderCourses() {
        if (!coursesContainer) return;
        coursesContainer.innerHTML = ''; // Clear previous content

        const start = (currentPage - 1) * coursesPerPage;
        const end = start + coursesPerPage;
        const paginatedCourses = filteredCourses.slice(start, end);

        if (paginatedCourses.length === 0) {
            coursesContainer.innerHTML = '<p class="text-center">Курсы не найдены.</p>';
            return;
        }

        paginatedCourses.forEach(course => {
            const courseCard = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${course.name}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Уровень: ${course.level}</h6>
                            <p class="card-text">${course.description.substring(0, 100)}...</p>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#order-modal" data-course-id="${course.id}">Записаться</button>
                        </div>
                    </div>
                </div>
            `;
            coursesContainer.insertAdjacentHTML('beforeend', courseCard);
        });
    }

    /**
     * Renders pagination controls.
     */
    function renderPagination() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = ''; // Clear previous content
        const pageCount = Math.ceil(filteredCourses.length / coursesPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.innerText = i;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                renderCourses();
                // Update active state
                document.querySelectorAll('.page-item').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
            });
            li.appendChild(a);
            paginationContainer.appendChild(li);
        }
    }

    /**
     * Applies filters and re-renders the course list.
     */
    function applyFiltersAndRender() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedLevel = levelSelect ? levelSelect.value : '';

        filteredCourses = allCourses.filter(course => {
            const nameMatch = course.name.toLowerCase().includes(searchTerm);
            const levelMatch = selectedLevel ? course.level === selectedLevel : true;
            return nameMatch && levelMatch;
        });

        currentPage = 1;
        renderCourses();
        renderPagination();
    }

    /**
     * Initializes the courses section.
     */
    async function initCourses() {
        if (coursesContainer) { // Only run this on pages with the courses container
            allCourses = await fetchCourses();
            applyFiltersAndRender();

            if (searchInput) {
                searchInput.addEventListener('input', applyFiltersAndRender);
            }
            if (levelSelect) {
                levelSelect.addEventListener('change', applyFiltersAndRender);
            }
        }
    }

    // Initialize the page
    initCourses();

    // --- Tutors Section Logic ---

    // State for tutors
    let allTutors = [];
    let filteredTutors = [];
    let selectedTutorId = null;

    // DOM Elements for tutors
    const tutorsContainer = document.getElementById('tutors-container');
    const tutorLangSelect = document.getElementById('tutor-language-select');
    const tutorExpInput = document.getElementById('tutor-experience-input');
    const orderBtn = document.getElementById('show-order-modal-btn');

    /**
     * Populates the language filter dropdown from available tutor languages.
     */
    function populateTutorFilters() {
        if (!tutorLangSelect) return;
        const languages = new Set(allTutors.flatMap(tutor => tutor.languages_offered));
        languages.forEach(lang => {
            const option = new Option(lang, lang);
            tutorLangSelect.add(option);
        });
    }

    /**
     * Renders tutor cards.
     */
    function renderTutors() {
        if (!tutorsContainer) return;
        tutorsContainer.innerHTML = '';

        if (filteredTutors.length === 0) {
            tutorsContainer.innerHTML = '<p class="text-center">Репетиторы не найдены.</p>';
            return;
        }

        filteredTutors.forEach(tutor => {
            const isSelected = tutor.id === selectedTutorId;
            const tutorCard = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 ${isSelected ? 'border-primary' : ''}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${tutor.name}</h5>
                            <p class="card-text"><strong>Опыт:</strong> ${tutor.work_experience} лет</p>
                            <p class="card-text"><strong>Языки:</strong> ${tutor.languages_offered.join(', ')}</p>
                            <p class="card-text"><strong>Цена:</strong> ${tutor.price_per_hour} руб./час</p>
                            <button class="btn ${isSelected ? 'btn-success' : 'btn-outline-primary'} select-tutor-btn" data-tutor-id="${tutor.id}">
                                ${isSelected ? 'Выбран' : 'Выбрать'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            tutorsContainer.insertAdjacentHTML('beforeend', tutorCard);
        });

        // Add event listeners to the new buttons
        document.querySelectorAll('.select-tutor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tutorId = parseInt(e.target.dataset.tutorId, 10);
                handleTutorSelection(tutorId);
            });
        });
    }
    
    /**
     * Handles the logic for selecting a tutor.
     * @param {number} tutorId 
     */
    function handleTutorSelection(tutorId) {
        if (selectedTutorId === tutorId) {
            // Deselect if clicking the same tutor again
            selectedTutorId = null;
            orderBtn.disabled = true;
        } else {
            selectedTutorId = tutorId;
            orderBtn.disabled = false;
        }
        // Re-render to update selection highlight and button text
        renderTutors();
    }

    /**
     * Applies filters and re-renders the tutor list.
     */
    function applyTutorFiltersAndRender() {
        const selectedLang = tutorLangSelect ? tutorLangSelect.value : '';
        const minExp = tutorExpInput ? parseInt(tutorExpInput.value, 10) || 0 : 0;

        filteredTutors = allTutors.filter(tutor => {
            const langMatch = selectedLang ? tutor.languages_offered.includes(selectedLang) : true;
            const expMatch = tutor.work_experience >= minExp;
            return langMatch && expMatch;
        });

        // Reset selection if the selected tutor is filtered out
        if (selectedTutorId && !filteredTutors.some(t => t.id === selectedTutorId)) {
            selectedTutorId = null;
            orderBtn.disabled = true;
        }
        
        renderTutors();
    }
    
    /**
     * Initializes the tutors section.
     */
    async function initTutors() {
        if (tutorsContainer) { // Only run this on pages with the tutors container
            allTutors = await fetchTutors();
            populateTutorFilters();
            applyTutorFiltersAndRender();

            if (tutorLangSelect) {
                tutorLangSelect.addEventListener('change', applyTutorFiltersAndRender);
            }
            if (tutorExpInput) {
                tutorExpInput.addEventListener('input', applyTutorFiltersAndRender);
            }
        }
    }

    // Initialize tutors section
    initTutors();

    // --- Main Page Order Modal Logic ---
    let currentItemForOrder = null; // Holds the selected course or tutor object

    const mainOrderModal = document.getElementById('order-modal');
    const bsMainOrderModal = mainOrderModal ? new bootstrap.Modal(mainOrderModal) : null;
    const mainOrderForm = document.getElementById('main-order-form');
     const totalPriceDisplay = document.getElementById('total-price-display');
 
     /**
      * Calculates the total price of an order based on form data and item data.
      * @param {object} formData - Object with form values (date_start, time_start, persons, duration, options).
      * @param {object} itemData - The full course or tutor object.
      * @param {string} itemType - 'course' or 'tutor'.
      * @returns {number} - The calculated total price.
      */
     function calculateTotalPrice(formData, itemData, itemType) {
         if (!formData || !itemData) return 0;
 
         // 1. Get base data
         const basePricePerHour = itemType === 'course' ? itemData.course_fee_per_hour : itemData.price_per_hour;
         const durationInWeeks = itemType === 'course' ? itemData.total_length : 0;
         const durationInHours = itemType === 'course' 
             ? itemData.total_length * itemData.week_length
             : formData.duration;
 
         const studentsNumber = formData.persons;
         const dateStr = formData.date_start;
         const timeStr = formData.time_start;
 
         let finalPrice = 0;
         if (!dateStr || !timeStr || !studentsNumber || !durationInHours) {
             return 0;
         }
 
         // 2. Calculate weekend/holiday multiplier
         const date = new Date(dateStr);
         const dayOfWeek = date.getDay();
         const isHoliday = HOLIDAYS_2025.includes(dateStr);
         const isWeekendOrHoliday = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) ? 1.5 : 1;
 
         // 3. Calculate time surcharges
         const hour = parseInt(timeStr.split(':')[0], 10);
         const morningSurcharge = (hour >= 9 && hour < 12) ? 400 : 0;
         const eveningSurcharge = (hour >= 18 && hour < 20) ? 1000 : 0;
 
         // 4. Calculate base total
         finalPrice = ((basePricePerHour * durationInHours * isWeekendOrHoliday) + morningSurcharge + eveningSurcharge) * studentsNumber;
 
         // 5. Apply automatic discounts/surcharges
         const oneMonthFromNow = new Date();
         oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
         const earlyRegistration = date > oneMonthFromNow;
         
         if (earlyRegistration) finalPrice *= 0.90; // 10% discount
         
         const groupEnrollment = studentsNumber >= 5;
         if (groupEnrollment) finalPrice *= 0.85; // 15% discount
         
         const isIntensive = itemType === 'course' && itemData.week_length >= 5;
         if (isIntensive) finalPrice *= 1.20; // 20% surcharge
 
         // 6. Apply user-selected options from formData
         if (formData.supplementary) finalPrice += (2000 * studentsNumber);
         if (formData.personalized) finalPrice += (1500 * durationInWeeks);
         if (formData.excursions) finalPrice *= 1.25; // +25%
         if (formData.assessment) finalPrice += 300;
         if (formData.interactive) finalPrice *= 1.50; // +50%
         
         return Math.round(finalPrice);
     }


    /**
     * Reads all data from a form into a structured object.
     * @param {HTMLFormElement} formElement - The form to read from.
     * @returns {object}
     */
    function getFormData(formElement) {
        return {
            date_start: formElement.querySelector('[id*="-date"]').value,
            time_start: formElement.querySelector('[id*="-time"]').value,
            persons: parseInt(formElement.querySelector('[id*="-persons"]').value, 10) || 0,
            duration: parseInt(formElement.querySelector('[id*="-duration"]').value, 10) || 0,
            supplementary: formElement.querySelector('[id*="-supplementary"]').checked,
            personalized: formElement.querySelector('[id*="-personalized"]').checked,
            excursions: formElement.querySelector('[id*="-excursions"]').checked,
            assessment: formElement.querySelector('[id*="-assessment"]').checked,
            interactive: formElement.querySelector('[id*="-interactive"]').checked,
        };
    }

    /**
     * Updates the total price display and auto-applied option info for a given form.
     * @param {HTMLFormElement} formElement - The form to update.
     * @param {object} itemData - The course or tutor object.
     */
    function updatePrice(formElement, itemData) {
        if (!formElement || !itemData) return;

        const formData = getFormData(formElement);
        const itemType = itemData.hasOwnProperty('course_fee_per_hour') ? 'course' : 'tutor';
        const finalPrice = calculateTotalPrice(formData, itemData, itemType);

        // Update auto-options info text
        const date = new Date(formData.date_start);
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        const earlyRegistration = date > oneMonthFromNow;
        const groupEnrollment = formData.persons >= 5;
        const isIntensive = itemType === 'course' && itemData.week_length >= 5;

        const infoEarlyReg = formElement.querySelector('[id*="info-early-reg"]');
        const infoGroupEnroll = formElement.querySelector('[id*="info-group-enroll"]');
        const infoIntensive = formElement.querySelector('[id*="info-intensive"]');

        if(infoEarlyReg) infoEarlyReg.textContent = earlyRegistration ? '✓ Скидка за раннюю регистрацию: -10%' : '';
        if(infoGroupEnroll) infoGroupEnroll.textContent = groupEnrollment ? '✓ Групповая скидка: -15%' : '';
        if(infoIntensive) infoIntensive.textContent = isIntensive ? '✓ Интенсивный курс: +20%' : '';

        // Update total price display
        const priceDisplay = formElement.parentElement.querySelector('[id*="total-price-display"]');
        if (priceDisplay) {
            priceDisplay.textContent = `Итоговая стоимость: ${finalPrice} руб.`;
        }
    }
 
     if (mainOrderModal) {
         // Listener to populate the modal
         mainOrderModal.addEventListener('show.bs.modal', (e) => {
             const button = e.relatedTarget;
             const courseId = button.dataset.courseId;
             const isTutorOrder = button.id === 'show-order-modal-btn';
 
             mainOrderForm.reset();
             const autoOptionsInfo = mainOrderForm.querySelector('#auto-options-info');
             if(autoOptionsInfo) autoOptionsInfo.querySelectorAll('small').forEach(el => el.textContent = '');
             
             let itemData;
             if (courseId) {
                itemData = allCourses.find(c => c.id == courseId);
                 if (itemData) {
                     mainOrderForm.querySelector('#form-order-type').value = 'course';
                     mainOrderForm.querySelector('#form-order-item-id').value = itemData.id;
                     mainOrderForm.querySelector('#form-order-name').value = itemData.name;
                     const durationInput = mainOrderForm.querySelector('#form-order-duration');
                     durationInput.value = itemData.total_length * itemData.week_length;
                     durationInput.disabled = true;
                 }
             } else if (isTutorOrder && selectedTutorId) {
                itemData = allTutors.find(t => t.id == selectedTutorId);
                 if (itemData) {
                     mainOrderForm.querySelector('#form-order-type').value = 'tutor';
                     mainOrderForm.querySelector('#form-order-item-id').value = itemData.id;
                     mainOrderForm.querySelector('#form-order-name').value = `Репетитор: ${itemData.name}`;
                     const durationInput = mainOrderForm.querySelector('#form-order-duration');
                     durationInput.value = 1; // Default to 1 hour
                     durationInput.disabled = false;
                 }
             }
             currentItemForOrder = itemData; // Store for recalculation
             updatePrice(mainOrderForm, currentItemForOrder);
         });
 
         // Add listeners to all form inputs to recalculate price on change
         const updatePriceHandler = () => updatePrice(mainOrderForm, currentItemForOrder);
         mainOrderForm.addEventListener('change', updatePriceHandler);
         mainOrderForm.addEventListener('input', updatePriceHandler);
 
         // Listener to handle form submission
         mainOrderForm.addEventListener('submit', async (e) => {
             e.preventDefault();
             const formData = getFormData(mainOrderForm);
             const itemType = mainOrderForm.querySelector('#form-order-type').value;
             const itemId = parseInt(mainOrderForm.querySelector('#form-order-item-id').value, 10);
             
             const finalPrice = calculateTotalPrice(formData, currentItemForOrder, itemType);
             
             const orderData = { ...formData, price: finalPrice };
 
             if (itemType === 'course') {
                 orderData.course_id = itemId;
             } else {
                 orderData.tutor_id = itemId;
             }
 
             try {
                 await createOrder(orderData);
                 showNotification('Заявка успешно создана!', 'success');
                 bsMainOrderModal.hide();
             } catch (error) {
                 // notification is shown in api.js
             }
         });
     }

    // --- Orders Page Logic ---
    let allOrders = [];
    let orderIdToDelete = null;
    let allCoursesForOrders = [];
    let allTutorsForOrders = [];
    let currentOrdersPage = 1;
    const ordersPerPage = 5;

    // DOM Elements for Orders
    const ordersTableBody = document.getElementById('orders-table-body');
    const noOrdersMessage = document.getElementById('no-orders-message');
    const ordersPaginationContainer = document.getElementById('orders-pagination');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteModal = document.getElementById('delete-modal');
    const bsDeleteModal = deleteModal ? new bootstrap.Modal(deleteModal) : null;
    const detailsModal = document.getElementById('details-modal');
    const detailsModalBody = document.getElementById('details-modal-body');
    const orderFormModal = document.getElementById('order-form-modal');
    const bsOrderFormModal = orderFormModal ? new bootstrap.Modal(orderFormModal) : null;
    const orderForm = document.getElementById('order-form');
    const orderFormLabel = document.getElementById('orderFormModalLabel');
    const orderIdInput = document.getElementById('order-id-input');



    /**
     * Renders orders for the current page.
     */
    function renderOrders() {
        if (!ordersTableBody) return;
        ordersTableBody.innerHTML = '';

        if (allOrders.length === 0) {
            noOrdersMessage.classList.remove('d-none');
            return;
        }

        noOrdersMessage.classList.add('d-none');
        
        const start = (currentOrdersPage - 1) * ordersPerPage;
        const end = start + ordersPerPage;
        const paginatedOrders = allOrders.slice(start, end);

        paginatedOrders.forEach((order, index) => {
            let name = 'Неизвестно';
            if (order.course_id) {
                const course = allCoursesForOrders.find(c => c.id === order.course_id);
                if (course) name = course.name;
            } else if (order.tutor_id) {
                const tutor = allTutorsForOrders.find(t => t.id === order.tutor_id);
                if (tutor) name = `Репетитор: ${tutor.name}`;
            }

            const orderRow = `
                <tr>
                    <th scope="row">${start + index + 1}</th>
                    <td>${name}</td>
                    <td>${new Date(order.date_start).toLocaleDateString()}</td>
                    <td>${order.price} руб.</td>
                    <td>
                        <button class="btn btn-info btn-sm details-btn" data-order-id="${order.id}" title="Подробнее" data-bs-toggle="modal" data-bs-target="#details-modal">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm edit-btn" data-order-id="${order.id}" title="Изменить" data-bs-toggle="modal" data-bs-target="#order-form-modal">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-btn" data-order-id="${order.id}" title="Удалить" data-bs-toggle="modal" data-bs-target="#delete-modal">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            ordersTableBody.insertAdjacentHTML('beforeend', orderRow);
        });
    }

    /**
     * Renders pagination controls for orders.
     */
    function renderOrdersPagination() {
        if (!ordersPaginationContainer) return;
        ordersPaginationContainer.innerHTML = '';
        const pageCount = Math.ceil(allOrders.length / ordersPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentOrdersPage ? 'active' : ''}`;
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.innerText = i;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentOrdersPage = i;
                renderOrders();
                // Update active state
                document.querySelectorAll('#orders-pagination .page-item').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
            });
            li.appendChild(a);
            ordersPaginationContainer.appendChild(li);
        }
    }

    /**
     * Initializes the Orders page.
     */
    async function initOrdersPage() {
        if (ordersTableBody) { // Check if we are on the personal account page
            [allOrders, allCoursesForOrders, allTutorsForOrders] = await Promise.all([
                fetchOrders(),
                fetchCourses(),
                fetchTutors()
            ]);
            
            renderOrders();
            renderOrdersPagination();

            // Event listener for action buttons
            ordersTableBody.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;

                if (target.classList.contains('delete-btn')) {
                    orderIdToDelete = target.dataset.orderId;
                }
                // Add handlers for details and edit later
            });

            // Event listener for modal confirm delete button
            if (confirmDeleteBtn) {
                confirmDeleteBtn.addEventListener('click', async () => {
                    if (!orderIdToDelete) return;

                    try {
                        await deleteOrder(orderIdToDelete);
                        showNotification('Заявка успешно удалена.', 'success');
                        
                        // Refresh data
                        allOrders = allOrders.filter(order => order.id != orderIdToDelete);
                        renderOrders();
                        renderOrdersPagination();

                        bsDeleteModal.hide();
                        orderIdToDelete = null;
                    } catch (error) {
                        // Notification is shown in the API function
                    }
                });
            }

            // Event listener for details modal
            if (detailsModal) {
                detailsModal.addEventListener('show.bs.modal', (e) => {
                    const button = e.relatedTarget;
                    const orderId = button.dataset.orderId;
                    const order = allOrders.find(o => o.id == orderId);
                    if (order) {
                        populateDetailsModal(order);
                    }
                });
            }

            // Event listener for order form modal (edit only on this page)
            if (orderFormModal) {
                let currentItemForEdit = null;

                const updateEditPriceHandler = () => updatePrice(orderForm, currentItemForEdit);

                orderFormModal.addEventListener('show.bs.modal', (e) => {
                    const button = e.relatedTarget;
                    const orderId = button ? button.dataset.orderId : null;
                    
                    if (orderId) {
                        orderFormLabel.textContent = 'Редактирование заявки';
                        const order = allOrders.find(o => o.id == orderId);
                        if (order) {
                            // Find the full course/tutor object for price calculation
                            currentItemForEdit = order.course_id 
                                ? allCoursesForOrders.find(c => c.id === order.course_id)
                                : allTutorsForOrders.find(t => t.id === order.tutor_id);
                            
                            populateOrderForm(order);
                            updatePrice(orderForm, currentItemForEdit); // Initial price calculation

                            orderForm.addEventListener('change', updateEditPriceHandler);
                            orderForm.addEventListener('input', updateEditPriceHandler);
                        }
                    }
                });

                orderFormModal.addEventListener('hide.bs.modal', () => {
                    orderForm.removeEventListener('change', updateEditPriceHandler);
                    orderForm.removeEventListener('input', updateEditPriceHandler);
                });

                orderForm.addEventListener('submit', (e) => handleOrderFormSubmit(e, currentItemForEdit));
            }
        }
    }

    /**
     * Populates the order form with existing order data for editing.
     * @param {object} order
     */
     function populateOrderForm(order) {
        orderForm.reset();
        orderIdInput.value = order.id;

        let name = 'Неизвестно';
        let itemType = '';
        if (order.course_id) {
            const course = allCoursesForOrders.find(c => c.id === order.course_id);
            if (course) {
                name = course.name;
                itemType = 'course';
            }
        } else if (order.tutor_id) {
            const tutor = allTutorsForOrders.find(t => t.id === order.tutor_id);
            if (tutor) {
                name = `Репетитор: ${tutor.name}`;
                itemType = 'tutor';
            }
        }
        orderForm.querySelector('#order-name').value = name;
        orderForm.querySelector('#order-date').value = order.date_start;
        orderForm.querySelector('#order-time').value = order.time_start;
        orderForm.querySelector('#order-persons').value = order.persons;
        
        const durationInput = orderForm.querySelector('#order-duration');
        durationInput.value = order.duration;
        durationInput.disabled = itemType === 'course';

        // Set checkboxes using the correct IDs for the edit modal
        orderForm.querySelector('#edit-opt-supplementary').checked = order.supplementary;
        orderForm.querySelector('#edit-opt-personalized').checked = order.personalized;
        orderForm.querySelector('#edit-opt-excursions').checked = order.excursions;
        orderForm.querySelector('#edit-opt-assessment').checked = order.assessment;
        orderForm.querySelector('#edit-opt-interactive').checked = order.interactive;
    }

    /**
     * Handles the submission of the create/edit order form.
     * @param {Event} event
     */
     async function handleOrderFormSubmit(event, itemData) {
        event.preventDefault();
        const orderId = orderIdInput.value;

        const formData = getFormData(orderForm);
        const itemType = itemData.hasOwnProperty('course_fee_per_hour') ? 'course' : 'tutor';
        const finalPrice = calculateTotalPrice(formData, itemData, itemType);

        const orderData = { ...formData, price: finalPrice };
        // We don't need to send the id of the course or tutor on update
        // as per API documentation (only fields that need to be updated).
        // But sending them shouldn't hurt if the backend ignores them.

        try {
            let updatedOrder;
            if (orderId) { // It's an update
                updatedOrder = await updateOrder(orderId, orderData);
                // Update the local array
                const index = allOrders.findIndex(o => o.id == orderId);
                if (index !== -1) {
                    allOrders[index] = updatedOrder;
                }
                showNotification('Заявка успешно обновлена!', 'success');
            }

            renderOrders();
            renderOrdersPagination();
            bsOrderFormModal.hide();

        } catch(error) {
            // Notification is shown in the API function
        }
    }


    /**
     * Populates the details modal with order information.
     * @param {object} order
     */
    function populateDetailsModal(order) {
        if (!detailsModalBody) return;

        let name = 'Неизвестно';
        let type = '';
        if (order.course_id) {
            const course = allCoursesForOrders.find(c => c.id === order.course_id);
            if (course) {
                name = course.name;
                type = 'Курс';
            }
        } else if (order.tutor_id) {
            const tutor = allTutorsForOrders.find(t => t.id === order.tutor_id);
            if (tutor) {
                name = `Репетитор: ${tutor.name}`;
                type = 'Репетитор';
            }
        }

        const options = [
            { key: 'early_registration', label: 'Скидка за раннюю регистрацию' },
            { key: 'group_enrollment', label: 'Групповая скидка' },
            { key: 'intensive_course', label: 'Интенсивный курс' },
            { key: 'supplementary', label: 'Доп. материалы' },
            { key: 'personalized', label: 'Индивидуальные занятия' },
            { key: 'excursions', label: 'Культурные экскурсии' },
            { key: 'assessment', label: 'Оценка уровня' },
            { key: 'interactive', label: 'Интерактивная платформа' },
        ];

        const selectedOptions = options.filter(opt => order[opt.key]).map(opt => `<li>${opt.label}</li>`).join('');

        const detailsHTML = `
            <p><strong>Тип:</strong> ${type}</p>
            <p><strong>Название:</strong> ${name}</p>
            <p><strong>Дата начала:</strong> ${new Date(order.date_start).toLocaleDateString()}</p>
            <p><strong>Время начала:</strong> ${order.time_start}</p>
            <p><strong>Количество человек:</strong> ${order.persons}</p>
            <p><strong>Продолжительность (часов):</strong> ${order.duration}</p>
            <hr>
            <h6>Выбранные опции:</h6>
            ${selectedOptions ? `<ul>${selectedOptions}</ul>` : '<p>Нет.</p>'}
            <hr>
            <h5 class="text-end">Итоговая стоимость: ${order.price} руб.</h5>
        `;
        detailsModalBody.innerHTML = detailsHTML;
    }


    // Initialize orders page
    initOrdersPage();
});

