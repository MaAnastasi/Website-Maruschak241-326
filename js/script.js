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
    const coursesPerPage = 6;

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
                            <a href="#" class="btn btn-primary">Подробнее</a>
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
});

