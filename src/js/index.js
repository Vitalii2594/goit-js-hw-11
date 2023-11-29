import { Report } from 'notiflix';
import { getImages } from './api';
import createMarkup from '../template/createMarcup';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PER_PAGE } from './constants';

const refs = {
  formEl: document.getElementById('searchForm'),
  galleryEl: document.querySelector('.gallery'),
  loadMore: document.getElementById('loadMore'),
  spanEl: document.querySelector('.js-span'),
};

refs.formEl.addEventListener('submit', onSubmitSearch);

let page = 1;
let value = '';
let totalHitsImg = 0;
let loading = false;

const observer = new IntersectionObserver(
  async entries => {
    const entry = entries[0];
    if (entry.isIntersecting && !loading && page * PER_PAGE < totalHitsImg) {
      loading = true;
      await onLoadMore();
      loading = false;
    }
  },
  { threshold: 1 }
);

async function onSubmitSearch(e) {
  e.preventDefault();
  value = e.currentTarget.elements.searchQuery.value.trim();
  if (!value) {
    message('Будь ласка, введіть правильні дані!');
    return;
  }
  try {
    clearGallery();
    const data = await getImages(page, value);
    const { hits, total, totalHits } = data;
    if (hits.length === 0) {
      message(
        'Вибачте, але зображень, що відповідають вашому запитанню, не знайдено. Будь ласка, спробуйте ще раз.'
      );
      return;
    }
    totalHitsImg = totalHits;
    messageInfo(`Ура! Ми знайшли ${totalHitsImg} зображень.`);
    const newGalery = hits.map(el => createMarkup(el)).join('');
    refs.galleryEl.insertAdjacentHTML('beforeend', newGalery);

    const lightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });

    if (totalHitsImg > 40) {
      refs.loadMore.classList.replace('load-more-hidden', 'load-more');
      refs.loadMore.disabled = false;
      refs.loadMore.addEventListener('click', onLoadMore);
      observer.observe(refs.loadMore);
      return;
    }
  } catch (error) {
    Report.failure('404', '');
    console.error(error);
  }
}

async function onLoadMore() {
  page += 1;
  refs.loadMore.disabled = true;
  try {
    const data = await getImages(page, value);
    const { hits } = data;

    if (hits.length === 0) {
      refs.loadMore.classList.replace('load-more', 'load-more-hidden');
      message('Вибачте, але ви дійшли до кінця результатів пошуку.');
      observer.unobserve(refs.loadMore);
      return;
    }

    const newGallery = hits.map(el => createMarkup(el)).join('');
    refs.galleryEl.insertAdjacentHTML('beforeend', newGallery);

    refs.loadMore.disabled = false;

    const lightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });

    if (page * PER_PAGE >= totalHitsImg) {
      refs.loadMore.classList.replace('load-more', 'load-more-hidden');
      message('Вибачте, але ви дійшли до кінця результатів пошуку.');
      observer.unobserve(refs.loadMore);
    }
  } catch (error) {
    Report.failure('Не вдалося завантажити більше зображень', '');
    console.error(error);
  }
}

function message(sms) {
  Report.warning(`Увага!`, `${sms}`);
}

function messageInfo(sms) {
  Report.warning(`Інформація`, `${sms}`);
}

function clearGallery() {
  totalHitsImg = 0;
  page = 1;
  refs.spanEl.innerHTML = '';
  refs.galleryEl.innerHTML = '';
}
