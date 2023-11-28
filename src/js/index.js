import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import InfiniteScroll from 'infinite-scroll';
import { fetchImages } from './api';
import { PER_PAGE } from './constants';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
let page = 1;
let loading = false; // Додали змінну, яка вказує, чи вже відбувається завантаження

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();
  page = 1;
  loadImages();
}

function updateGallery(images) {
  if (!images || images.length === 0) {
    Notiflix.Notify.info('No images found.');
    return;
  }

  const cardsHtml = images.map(createCardHtml).join('');

  if (page === 1) {
    gallery.innerHTML = cardsHtml;
  } else {
    gallery.innerHTML += cardsHtml;
  }

  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}

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

function loadImages() {
  // Якщо вже відбувається завантаження, не відправляти новий запит
  if (loading) {
    return;
  }

  loading = true; // Позначаємо, що розпочинається завантаження

  // Використовуємо `fetchImages` для отримання зображень
  fetchImages(form.elements.searchQuery.value.trim(), page)
    .then(images => {
      updateGallery(images);
      loading = false; // Позначаємо, що завантаження завершилося
      page++; // Збільшуємо номер сторінки для наступного завантаження
    })
    .catch(error => {
      console.error('Error fetching images:', error);
      Notiflix.Notify.failure('Something went wrong. Please try again.');
      loading = false; // Позначаємо, що завантаження завершилося (навіть якщо виникла помилка)
    });
}

const infScroll = new InfiniteScroll('.gallery', {
  path: function () {
    return ' '; // Повертаємо простий рядок, оскільки дані вже завантажуються з `loadImages`
  },
  responseType: 'text',
  history: false,
  scrollThreshold: 300,
});

// При прокручуванні вниз викликаємо функцію `loadImages`
infScroll.on('scrollThreshold', loadImages);
