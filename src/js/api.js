// Імпорт бібліотек та констант для використання в функції
import axios from 'axios';
import { API_KEY, BASE_URL, PER_PAGE } from './constants';

// Функція для отримання зображень з сервера за допомогою API Pixabay
export async function getImages(page = 1, value) {
  // Створюємо локальну змінну qValue та присвоюємо їй значення параметру value
  const qValue = value;

  // Налаштовуємо конфігурацію бібліотеки axios для встановлення параметрів запиту
  axios.defaults.baseURL = BASE_URL;
  axios.defaults.params = {
    key: API_KEY,
    q: qValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: PER_PAGE,
    page: page,
  };

  // Виконуємо запит за допомогою axios.get() та отримуємо відповідь
  const { data } = await axios.get();

  // Повертаємо дані, які містять отримані зображення
  return data;
}
