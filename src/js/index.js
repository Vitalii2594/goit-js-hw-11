import { Report } from 'notiflix'; 
 import { getImages } from './api'; 
 import createMarkup from '../template/createMarcup'; 
 import SimpleLightbox from 'simplelightbox'; 
 import 'simplelightbox/dist/simple-lightbox.min.css'; 
 import 'simplelightbox/dist/simple-lightbox.min.css'; 
 import { PER_PAGE } from './constans'; 
  
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
  
 async function onSubmitSearch(e) { 
   e.preventDefault(); 
   value = e.currentTarget.elements.searchQuery.value.trim(); 
   if (!value) { 
     message('Please write correct data!'); 
     return; 
   } 
   try { 
     clearGallery(); 
     const data = await getImages(page, value); 
     // console.log(data); 
     const { hits, total, totalHits } = data; 
     if (hits.length === 0) { 
       message( 
         'Sorry, there are no images matching your search query. Please try again.' 
       ); 
       return; 
     } 
     totalHitsImg = totalHits; 
     messageInfo(`Hooray! We found ${totalHitsImg} images.`); 
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
  
     const newGallery = hits.map(el => createMarkup(el)).join(''); 
     refs.galleryEl.insertAdjacentHTML('beforeend', newGallery); 
  
     refs.loadMore.disabled = false; 
     // lightbox.refresh(); 
  
     const lightbox = new SimpleLightbox('.gallery a', { 
       captions: true, 
       captionsData: 'alt', 
       captionPosition: 'bottom', 
       captionDelay: 250, 
     }); 
  
     if (page * PER_PAGE >= totalHitsImg) { 
       refs.loadMore.classList.replace('load-more', 'load-more-hidden'); 
       message("We're sorry, but you've reached the end of search results."); 
     } 
   } catch (error) { 
     Report.failure('Failed to load more images', ''); 
     console.error(error); 
   } 
 } 
  
 function message(sms) { 
   Report.warning(`Warning!`, `${sms}`); 
 } 
  
 function messageInfo(sms) { 
   Report.warning(`Info`, `${sms}`); 
 } 
  
 function clearGallery() { 
   totalHitsImg = 0; 
   page = 1; 
   refs.spanEl.innerHTML = ''; 
   refs.galleryEl.innerHTML = ''; 
 }