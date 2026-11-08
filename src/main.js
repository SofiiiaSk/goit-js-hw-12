import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const PER_PAGE = 15;

const form = document.querySelector('.form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.btn-load-more');

let searchQuery = '';
let page = 1;

// Повертає true, якщо запит виконався, і false, якщо була помилка
async function fetchAndRender() {
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(searchQuery, page);

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return true;
    }

    createGallery(data.hits);

    if (page * PER_PAGE < data.totalHits) {
      showLoadMoreButton();
    } else {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

    return true;
  } catch {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
    return false;
  } finally {
    hideLoader();
  }
}

function scrollGallery() {
  const card = gallery.querySelector('.gallery-item');
  if (!card) return;

  const { height } = card.getBoundingClientRect();
  window.scrollBy({ top: height * 2, behavior: 'smooth' });
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  const query = form.elements['search-text'].value.trim();
  if (!query) return;

  searchQuery = query;
  page = 1;
  clearGallery();
  hideLoadMoreButton();

  await fetchAndRender();
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;

  const isSuccess = await fetchAndRender();

  if (!isSuccess) {
    page -= 1;
    showLoadMoreButton();
    return;
  }

  scrollGallery();
});
