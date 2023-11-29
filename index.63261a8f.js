let e;const t=document.getElementById("search-form"),o=document.querySelector(".gallery");let n=1,i=!1,l=!0;async function s(t){t.preventDefault(),n=1,l=!0,e=void 0,r()}function a(e){return`
    <div class="photo-card">
      <a href="${e.largeImageURL}" class="lightbox-link">
        <img src="${e.webformatURL}" alt="${e.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${e.likes}</p>
        <p class="info-item"><b>Views:</b> ${e.views}</p>
        <p class="info-item"><b>Comments:</b> ${e.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${e.downloads}</p>
      </div>
    </div>
  `}function r(){!i&&l&&(i=!0,fetchImages(t.elements.searchQuery.value.trim(),n).then(t=>{t.length<PER_PAGE&&(l=!1),function(t){if(!t||0===t.length){Notiflix.Notify.info("No images found.");return}let i=t.map(a).join("");1===n?(o.innerHTML=i,new SimpleLightbox(".gallery a").refresh(),e=t[0].totalHits,Notiflix.Notify.success(`Hooray! We found ${e} images.`)):o.innerHTML+=i}(t),i=!1,n++,console.log(`Page: ${n}, Total Images: ${t.length}`)}).catch(e=>{console.error("Error fetching images:",e),Notiflix.Notify.failure("Something went wrong. Please try again."),i=!1}))}t.addEventListener("submit",s),new InfiniteScroll(".gallery",{path:function(){return" "},responseType:"text",history:!1,scrollThreshold:300}).on("scrollThreshold",r),searchGallery();
//# sourceMappingURL=index.63261a8f.js.map
