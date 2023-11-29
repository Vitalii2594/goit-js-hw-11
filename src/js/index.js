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
let firstLoad = true;

const successMessage = 'Ура! Знайдено зображень:';

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();
  page = 1;
  hasMoreImages = true;
  firstLoad = true;
  loadImages();
}

function updateGallery(images) {
  if (!images || images.length === 0) {
    Notiflix.Notify.info('Зображення не знайдено.');
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

  if (firstLoad) {
    Notiflix.Notify.success(`${successMessage} ${images[0].totalHits}.`);
    firstLoad = false;
  }
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
      Notiflix.Notify.failure('Щось пішло не так. Будь ласка, спробуйте знову.');
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
