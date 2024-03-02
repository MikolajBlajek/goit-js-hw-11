import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const input = document.querySelector('input');
const apiKey = '42631072-6b0d19ed7a3e888324b209d49';
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.button-container');

let page = 1;

loadMore.hidden = true;

const fetchImg = async currentPage => {
  try {
    const searchParams = new URLSearchParams({
      key: apiKey,
      q: input.value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: currentPage,
      per_page: 40,
    });

    const response = await axios.get(
      `https://pixabay.com/api/?${searchParams}`
    );
    const images = response.data.hits;
    loadMore.hidden = false;
    if (images.length === 0) {
      loadMore.hidden = true;

      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (images.length > 0 && images.length < 40) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMore.hidden = true;
    }

    return images.map(image => ({
      webformatURL: image.webformatURL,
      largeImageURL: image.largeImageURL,
      tags: image.tags,
      likes: image.likes,
      views: image.views,
      comments: image.comments,
      downloads: image.downloads,
    }));
  } catch (error) {
    throw error;
  }
};

const fetchAndRenderImg = async currentPage => {
  try {
    const images = await fetchImg(currentPage);
    gallery.innerHTML += images
      .map(
        item => ` 
        <div class="photo-card"> 
          <div class="block-size">
          <a href="${item.largeImageURL}" data-lightbox="gallery">
            <img class="photo-card-img" src="${item.largeImageURL}" alt="${item.tags}" loading="lazy" />
          </a>
          </div>
          <div class="info">
            <p class="info-item"><b>Likes:</b> ${item.likes}</p>
            <p class="info-item"><b>Views:</b> ${item.views}</p>
            <p class="info-item"><b>Comments:</b> ${item.comments}</p>
            <p class="info-item"><b>Downloads:</b> ${item.downloads}</p>
          </div>
        </div>
      `
      )
      .join('');

    const lightbox = new SimpleLightbox('.gallery a');

    lightbox.refresh();

    if (images.length === 0) {
      loadMore.hidden = true;
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};

form.addEventListener('submit', async e => {
  e.preventDefault();
  page = 1;
  gallery.innerHTML = '';
  await fetchAndRenderImg(page);
});

loadMore.addEventListener('click', () => {
  page++;
  fetchAndRenderImg(page);
});