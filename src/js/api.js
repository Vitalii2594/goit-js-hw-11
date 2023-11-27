import axios from 'axios';

const apiKey = '27645938-d5cd7e38904ea113c0dc0ae51';

async function fetchImages(query, page) {
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

  const response = await axios.get(url);

  if (response.data.hits.length === 0) {
    throw new Error('No images found for the given query');
  }

  return response.data.hits;
}

export { fetchImages };
