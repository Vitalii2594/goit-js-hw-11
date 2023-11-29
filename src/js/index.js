// Імпорт бібліотек та модулів
import { Report } from 'notiflix'; // Бібліотека для виведення повідомлень
import { getImages } from './api'; // Функція для отримання зображень з сервера
import createMarkup from '../template/createMarcup'; // Функція для створення HTML-розмітки зображень
import SimpleLightbox from 'simplelightbox'; // Бібліотека для легкого перегляду зображень в модальному вікні
import 'simplelightbox/dist/simple-lightbox.min.css'; // Стилі для SimpleLightbox
import { PER_PAGE } from './constants'; // Константи, такі як кількість зображень на сторінці

// Оголошення змінних для посилань на елементи DOM
const refs = {
  formEl: document.getElementById('searchForm'),
  galleryEl: document.querySelector('.gallery'),
  loadMore: document.getElementById('loadMore'),
  spanEl: document.querySelector('.js-span'),
};

// Додаємо подію submit на форму пошуку
refs.formEl.addEventListener('submit', onSubmitSearch);

// Змінні для відслідковування номеру сторінки, значення пошукового запиту та загальної кількості зображень
let page = 1;
let value = '';
let totalHitsImg = 0;

// Флаг для уникнення одночасних запитів на завантаження
let loading = false;

// Створюємо Intersection Observer для відслідковування видимості кнопки "Load more"
const observer = new IntersectionObserver(
  async entries => {
    const entry = entries[0];
    // Перевіряємо, чи кнопка "Load more" стала видимою, користувач прокрутив до неї
    if (entry.isIntersecting && !loading && page * PER_PAGE < totalHitsImg) {
      // Встановлюємо флаг loading, щоб уникнути одночасних запитів
      loading = true;
      // Викликаємо функцію завантаження додаткових зображень
      await onLoadMore();
      // Знімаємо флаг loading після завершення завантаження
      loading = false;
    }
  },
  { threshold: 1 } // Визначаємо поріг видимості (весь елемент повинен бути видимий)
);

// Функція, яка викликається при поданні форми пошуку
async function onSubmitSearch(e) {
  e.preventDefault();
  // Отримуємо значення з поля вводу
  value = e.currentTarget.elements.searchQuery.value.trim();
  if (!value) {
    // Виводимо повідомлення про невірні дані, якщо поле порожнє
    message('Будь ласка, введіть правильні дані!');
    return;
  }
  try {
    // Очищаємо галерею та отримуємо перші зображення з сервера
    clearGallery();
    const data = await getImages(page, value);
    const { hits, total, totalHits } = data;
    if (hits.length === 0) {
      // Виводимо повідомлення, якщо не знайдено зображень
      message(
        'Вибачте, але зображень, що відповідають вашому запитанню, не знайдено. Будь ласка, спробуйте ще раз.'
      );
      return;
    }
    // Оновлюємо загальну кількість зображень
    totalHitsImg = totalHits;
    // Виводимо інформаційне повідомлення про кількість знайдених зображень
    messageInfo(`Ура! Ми знайшли ${totalHitsImg} зображень.`);
    // Створюємо розмітку для зображень та додаємо її до галереї
    const newGalery = hits.map(el => createMarkup(el)).join('');
    refs.galleryEl.insertAdjacentHTML('beforeend', newGalery);

    // Ініціалізуємо SimpleLightbox для нових зображень
    const lightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });

    // Показуємо кнопку "Load more", якщо загальна кількість зображень більше 40
    if (totalHitsImg > 40) {
      refs.loadMore.classList.replace('load-more-hidden', 'load-more');
      refs.loadMore.disabled = false;
      refs.loadMore.addEventListener('click', onLoadMore);
      // Починаємо спостереження за кнопкою "Load more"
      observer.observe(refs.loadMore);
      return;
    }
  } catch (error) {
    // Виводимо повідомлення про помилку та записуємо її в консоль
    Report.failure('404', '');
    console.error(error);
  }
}

// Функція, яка викликається при натисканні кнопки "Load more"
async function onLoadMore() {
  // Інкрементуємо номер сторінки
  page += 1;
  refs.loadMore.disabled = true;
  try {
    // Запит на сервер для отримання додаткових зображень
    const data = await getImages(page, value);
    const { hits } = data;

    // Якщо отримано 0 зображень, закриваємо кнопку "Load more"
    if (hits.length === 0) {
      refs.loadMore.classList.replace('load-more', 'load-more-hidden');
      message('Вибачте, але ви дійшли до кінця результатів пошуку.');
      // Зупиняємо спостереження за кнопкою "Load more"
      observer.unobserve(refs.loadMore);
      return;
    }

    // Додаємо нові зображення до галереї
    const newGallery = hits.map(el => createMarkup(el)).join('');
    refs.galleryEl.insertAdjacentHTML('beforeend', newGallery);

    // Вмикаємо кнопку "Load more"
    refs.loadMore.disabled = false;

    // Ініціалізуємо SimpleLightbox для нових зображень
    const lightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });

    // Перевіряємо, чи досягли кінця результатів пошуку
    if (page * PER_PAGE >= totalHitsImg) {
      refs.loadMore.classList.replace('load-more', 'load-more-hidden');
      message('Вибачте, але ви дійшли до кінця результатів пошуку.');
      // Зупиняємо спостереження за кнопкою "Load more"
      observer.unobserve(refs.loadMore);
    }
  } catch (error) {
    // Виводимо повідомлення про помилку та записуємо її в консоль
    Report.failure('Не вдалося завантажити більше зображень', '');
    console.error(error);
  }
}

// Функція для виведення предупреждення
function message(sms) {
  Report.warning(`Увага!`, `${sms}`);
}

// Функція для виведення інформаційного повідомлення
function messageInfo(sms) {
  Report.warning(`Інформація`, `${sms}`);
}

// Функція для очищення галереї та скидання змінних
function clearGallery() {
  totalHitsImg = 0;
  page = 1;
  refs.spanEl.innerHTML = '';
  refs.galleryEl.innerHTML = '';
}

// ... (інший існуючий код)
