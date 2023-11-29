import axios from 'axios'; 
 import { API_KEY, BASE_URL, PER_PAGE } from './constants'; 
  
 export async function getImages(page = 1, value) { 
   const qValue = value; 
  
   axios.defaults.baseURL = BASE_URL; 
   axios.defaults.params = { 
     key: API_KEY, 
     q: qValue, 
     image_type: 'photo', 
     orientation: 'horizontal', 
     safesearch: true, 
     per_page: PER_PAGE, 
     page: page, 
   }; 
   // return await axios.get(BASE_URL); 
   const { data } = await axios.get(); 
   return data;