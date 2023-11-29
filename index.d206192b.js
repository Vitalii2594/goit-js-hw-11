let e;const o=document.getElementById("search-form"),t=document.querySelector(".gallery");let i=1,n=!1,l=!0;async function s(o){o.preventDefault(),i=1,l=!0,e=void 0,r()}function a(e){return`
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
  `}function r(){!n&&l&&(n=!0,fetchImages(o.elements.searchQuery.value.trim(),i).then(o=>{o.length<PER_PAGE&&(l=!1),function(o){if(!o||0===o.length){Notiflix.Notify.info("No images found.");return}let n=o.map(a).join("");1===i?t.innerHTML=n:t.innerHTML+=n,new SimpleLightbox(".gallery a").refresh(),void 0===e&&(e=o[0].totalHits,Notiflix.Notify.success(`Hooray! We found ${e} images.`))}(o),n=!1,i++,console.log(`Page: ${i}, Total Images: ${o.length}`)}).catch(e=>{console.error("Error fetching images:",e),Notiflix.Notify.failure("Something went wrong. Please try again."),n=!1}))}o.addEventListener("submit",s),new InfiniteScroll(".gallery",{path:function(){return" "},responseType:"text",history:!1,scrollThreshold:300}).on("scrollThreshold",r);
//# sourceMappingURL=index.d206192b.js.map
