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
let hasMoreImages = true;
let totalHits; // Змінна для зберігання кількості зображень

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();
  page = 1;
  hasMoreImages = true;
  totalHits = undefined; // Скидаємо значення кількості при новому запиті
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

    if (totalHits === undefined) {
      // Виводимо повідомлення тільки при першому завантаженні
      Notiflix.Notify.success(
        `Hooray! We found ${images[0].totalHits} images.`
      );
      totalHits = images[0].totalHits; // Зберігаємо значення кількості для подальших порівнянь
    }
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
  if (loading || !hasMoreImages) {
    return;
  }

  loading = true;

  fetchImages(form.elements.searchQuery.value.trim(), page)
    .then(images => {
      if (images.length < PER_PAGE) {
        hasMoreImages = false;
      }

      updateGallery(images);
      loading = false;
      page++;

      console.log(`Page: ${page}, Total Images: ${images.length}`);
    })
    .catch(error => {
      console.error('Error fetching images:', error);
      Notiflix.Notify.failure('Something went wrong. Please try again.');
      loading = false;
    });
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
