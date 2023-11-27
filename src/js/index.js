import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './api';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let page = 1;

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();
  page = 1; // Reset page when a new search is initiated
  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    return;
  }

  try {
    const images = await fetchImages(searchQuery, page);
    updateGallery(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Something went wrong. Please try again.');
  }
}

function updateGallery(images) {
  if (page === 1) {
    gallery.innerHTML = ''; // Clear the gallery for new search results
  }

  const cardsHtml = images.map(createCardHtml).join('');
  gallery.innerHTML += cardsHtml;

  page += 1;
  loadMoreBtn.style.display = 'block';

  // Initialize SimpleLightbox
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();

  // Scroll to the newly loaded images
  scrollToNewImages();
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

function scrollToNewImages() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
