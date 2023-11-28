// Оголошуємо змінні
const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
let page = 1;
let loading = false;
let hasMoreImages = true;
let totalHits;

// Додаємо обробник подачі форми
form.addEventListener('submit', handleFormSubmit);

// Функція для обробки подачі форми
async function handleFormSubmit(event) {
  event.preventDefault();
  // Скидаємо значення при подачі нового запиту
  page = 1;
  hasMoreImages = true;
  totalHits = undefined;
  // Викликаємо функцію для завантаження зображень
  loadImages();
}

// Функція для оновлення галереї зображень
function updateGallery(images) {
  // Перевіряємо, чи є зображення
  if (!images || images.length === 0) {
    Notiflix.Notify.info('No images found.');
    return;
  }

  // Генеруємо HTML для зображень
  const cardsHtml = images.map(createCardHtml).join('');

  // Оновлюємо галерею зображень
  if (page === 1) {
    gallery.innerHTML = cardsHtml;
  } else {
    gallery.innerHTML += cardsHtml;
  }

  // Ініціалізуємо lightbox для перегляду зображень
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();

  // Перевіряємо, чи не виводили вже повідомлення про загальну кількість зображень
  if (totalHits === undefined) {
    // Встановлюємо totalHits як кількість з першого зображення
    totalHits = images[0].totalHits;
    // Виводимо повідомлення
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }
}

// Функція для створення HTML-коду для кожного зображення
function createCardHtml(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}" class="lightbox-link">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </div>
  `;
}

// Функція для завантаження зображень
function loadImages() {
  // Перевіряємо, чи вже виконується завантаження або немає додаткових зображень
  if (loading || !hasMoreImages) {
    return;
  }

  // Позначаємо початок завантаження
  loading = true;

  // Викликаємо функцію для отримання зображень з сервера
  fetchImages(form.elements.searchQuery.value.trim(), page)
    .then(images => {
      // Перевіряємо, чи отримано додаткові зображення
      if (images.length < PER_PAGE) {
        // Якщо немає, вказуємо, що більше зображень немає
        hasMoreImages = false;
      }

      // Викликаємо функцію для оновлення галереї
      updateGallery(images);

      // Позначаємо завершення завантаження
      loading = false;

      // Інкрементуємо сторінку
      page++;

      // Виводимо інформацію в консоль для налагодження
      console.log(`Page: ${page}, Total Images: ${images.length}`);
    })
    .catch(error => {
      // Обробляємо помилку і виводимо сповіщення
      console.error('Error fetching images:', error);
      Notiflix.Notify.failure('Something went wrong. Please try again.');

      // Позначаємо завершення завантаження при помилці
      loading = false;
    });
}

// Ініціалізуємо Infinite Scroll для автоматичного завантаження зображень при прокручуванні
const infScroll = new InfiniteScroll('.gallery', {
  path: function () {
    return ' ';
  },
  responseType: 'text',
  history: false,
  scrollThreshold: 300,
});

// Додаємо обробник події "scrollThreshold", який викликає функцію завантаження зображень
infScroll.on('scrollThreshold', loadImages);
