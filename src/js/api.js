// api.js
import axios from 'axios';
import { API_KEY, BASE_URL, PER_PAGE } from './constans';

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

  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');

  const url = `${BASE_URL}?${queryString}`;

  const response = await axios.get(url);

  if (response.data.hits.length === 0) {
    throw new Error('No images found for the given query');
  }

  return response.data.hits;
}

export { fetchImages };
