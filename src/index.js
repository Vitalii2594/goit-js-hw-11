import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import InfiniteScroll from 'infinite-scroll';
import { fetchImages } from './api';
import { PER_PAGE } from './constants';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
let page = 1;

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();
  page = 1;

  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notiflix.Notify.warning('Please enter a search query.');
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

function scrollToBottom() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

const infScroll = new InfiniteScroll('.gallery', {
  path: function () {
    const currentPage = page++;

    const params = {
      key: '27645938-d5cd7e38904ea113c0dc0ae51',
      q: form.elements.searchQuery.value.trim(),
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: currentPage,
      per_page: PER_PAGE,
    };

    const queryString = Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join('&');

    return `https://pixabay.com/api/?${queryString}`;
  },
  responseType: 'text',
  history: false,
  scrollThreshold: 300,
});

infScroll.on('load', async function () {
  try {
    const images = await fetchImages(
      form.elements.searchQuery.value.trim(),
      page
    );

    if (images && images.length > 0) {
      updateGallery(images);

      setTimeout(scrollToBottom, 500);
    }
  } catch (error) {
    console.error('Error fetching more images:', error);
    Notiflix.Notify.failure('Something went wrong while loading more images.');
  }
});
