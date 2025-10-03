 const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
    const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const moviesGrid = document.getElementById('movies-grid');
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');
    const resultsInfo = document.getElementById('results-info');
    const noResults = document.getElementById('no-results');
    const categoryBtns = document.querySelectorAll('.category-btn');

    // Load popular movies on page load
    loadPopularMovies();

    // Search functionality
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        searchMovies(query);
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });

    // Category buttons
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const query = btn.dataset.query;
        searchInput.value = query;
        searchMovies(query);
      });
    });

    // Load popular movies
    async function loadPopularMovies() {
      showLoading();
      try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
        if (!response.ok) throw new Error('Failed to load movies');
        const data = await response.json();
        displayMovies(data.results, 'Popular Movies');
      } catch (err) {
        showError('Failed to load popular movies. Please try again.');
      }
    }

    // Search movies
    async function searchMovies(query) {
      showLoading();
      try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        
        if (data.results.length === 0) {
          showNoResults();
        } else {
          displayMovies(data.results, `Search Results for "${query}"`);
        }
      } catch (err) {
        showError('Failed to search movies. Please try again.');
      }
    }

    // Display movies
    function displayMovies(movies, title) {
      hideLoading();
      error.classList.add('hidden');
      noResults.classList.add('hidden');
      
      resultsInfo.textContent = `${title} (${movies.length} movies)`;
      resultsInfo.classList.remove('hidden');
      
      moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="showMovieDetails(${movie.id})">
          ${movie.poster_path 
            ? `<img src="${IMG_BASE}${movie.poster_path}" alt="${movie.title}" class="movie-poster">`
            : `<div class="movie-poster no-image">🎬</div>`
          }
          <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</div>
            ${movie.vote_average > 0 ? `<span class="movie-rating">⭐ ${movie.vote_average.toFixed(1)}</span>` : ''}
          </div>
        </div>
      `).join('');
    }

    // Show movie details
    async function showMovieDetails(movieId) {
      try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits`);
        if (!response.ok) throw new Error('Failed to load details');
        const movie = await response.json();
        
        const backdropUrl = movie.backdrop_path ? `${BACKDROP_BASE}${movie.backdrop_path}` : '';
        const director = movie.credits?.crew?.find(person => person.job === 'Director')?.name || 'N/A';
        const cast = movie.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || 'N/A';
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
          ${backdropUrl ? `<div class="modal-backdrop" style="background-image: url('${backdropUrl}')"></div>` : ''}
          <div class="modal-details">
            <h2 class="modal-title">${movie.title}</h2>
            <div class="modal-meta">
              <div class="meta-item"><strong>Rating:</strong> ⭐ ${movie.vote_average.toFixed(1)}/10</div>
              <div class="meta-item"><strong>Release:</strong> ${movie.release_date || 'N/A'}</div>
              <div class="meta-item"><strong>Runtime:</strong> ${movie.runtime || 'N/A'} min</div>
            </div>
            <div class="modal-plot">${movie.overview || 'No overview available.'}</div>
            <div class="modal-extra">
              <div class="extra-item">
                <div class="extra-label">Director</div>
                <div class="extra-value">${director}</div>
              </div>
              <div class="extra-item">
                <div class="extra-label">Cast</div>
                <div class="extra-value">${cast}</div>
              </div>
              <div class="extra-item">
                <div class="extra-label">Genres</div>
                <div class="extra-value">${movie.genres?.map(g => g.name).join(', ') || 'N/A'}</div>
              </div>
              <div class="extra-item">
                <div class="extra-label">Budget</div>
                <div class="extra-value">$${(movie.budget || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        `;
        
        modal.classList.add('show');
      } catch (err) {
        showError('Failed to load movie details.');
      }
    }

    // Modal close
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });

    // Helper functions
    function showLoading() {
      loading.classList.remove('hidden');
      moviesGrid.innerHTML = '';
      resultsInfo.classList.add('hidden');
      error.classList.add('hidden');
      noResults.classList.add('hidden');
    }

    function hideLoading() {
      loading.classList.add('hidden');
    }

    function showError(message) {
      hideLoading();
      error.textContent = message;
      error.classList.remove('hidden');
      moviesGrid.innerHTML = '';
      resultsInfo.classList.add('hidden');
    }

    function showNoResults() {
      hideLoading();
      noResults.classList.remove('hidden');
      moviesGrid.innerHTML = '';
      resultsInfo.classList.add('hidden');
    }