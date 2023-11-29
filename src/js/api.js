import axios from 'axios';
import { API_KEY, BASE_URL, PER_PAGE } from './constants';

async function fetchImages(query, page) {
  const params = {
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: PER_PAGE,
  };

  try {
    const response = await axios.get(BASE_URL, { params });
    const { hits, totalHits } = response.data;

    if (hits.length === 0) {
      throw new Error('No images found for the given query');
    }

    return { hits, totalHits }; // Modified to return totalHits along with hits
  } catch (error) {
    throw new Error('Error fetching images:', error);
  }
}

export { fetchImages };
