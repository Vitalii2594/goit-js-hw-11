// index.js
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './api';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
let page = 1;
let loading = false;

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
    const { images, totalHits } = result;

    if (page === 1) {
      Notiflix.Notify.success(`Total images found: ${totalHits}`);
    }

    updateGallery(images);
    page++;
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Something went wrong. Please try again.');
  } finally {
    loading = false;
  }
}

// При кожному прокручуванні вниз викликаємо функцію `loadImages`
window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 300) {
    loadImages();
  }
});
