const API_BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru';
// ВАЖНО: Замените 'YOUR_API_KEY' на ваш реальный ключ API
const API_KEY = 'a4746536-b541-494b-bb57-12c858564a20';

/**
 * Fetches courses from the API.
 * @returns {Promise<any>}
 */
async function fetchCourses() {
    const url = new URL(`${API_BASE_URL}/api/courses`);
    url.searchParams.append('api_key', API_KEY);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // try to parse error, but don't fail if it's not JSON
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch courses:", error);
        if (typeof showNotification === 'function') {
            showNotification(`Не удалось загрузить курсы: ${error.message}`, 'danger');
        }
        return [];
    }
}

/**
 * Fetches tutors from the API.
 * @returns {Promise<any>}
 */
async function fetchTutors() {
    const url = new URL(`${API_BASE_URL}/api/tutors`);
    url.searchParams.append('api_key', API_KEY);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // try to parse error, but don't fail if it's not JSON
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch tutors:", error);
        if (typeof showNotification === 'function') {
            showNotification(`Не удалось загрузить репетиторов: ${error.message}`, 'danger');
        }
        return [];
    }
}
