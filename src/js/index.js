import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import InfiniteScroll from 'infinite-scroll';
import { fetchImages } from './api';
import { PER_PAGE } from './constants';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
let page = 1;
let loading = false;
let totalImages = 0; // Додали змінну для збереження загальної кількості зображень

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
    totalImages = images.length; // Запам'ятовуємо загальну кількість зображень при першому завантаженні
    Notiflix.Notify.success(`Total images found: ${totalImages}`);
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

async function loadImages() {
  if (loading) {
    return;
  }

  loading = true;

  try {
    const result = await fetchImages(
      form.elements.searchQuery.value.trim(),
      page
    );

    if (page === 1) {
      totalImages = result.totalHits; // Оновлюємо загальну кількість зображень при кожному запиті
      Notiflix.Notify.success(`Total images found: ${totalImages}`);
    }

    updateGallery(result.images);
    loading = false;
    page++;
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Something went wrong. Please try again.');
    loading = false;
  }
}

const infScroll = new InfiniteScroll('.gallery', {
  path: function () {
    return ' ';
  },
  responseType: 'text',
  history: false,
  scrollThreshold: 300,
});

infScroll.on('scrollThreshold', loadImages);
