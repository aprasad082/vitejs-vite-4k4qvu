'use strict';

let products = [];
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 0;

const showLoadingSkeleton = () => {
  const productsContainer = document.getElementById('products');
  productsContainer.innerHTML = ''; // Clear existing products

  for (let i = 0; i < itemsPerPage; i++) {
    const skeletonElement = document.createElement('div');
    skeletonElement.classList.add('product');

    skeletonElement.innerHTML = `
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton" style="height: 30px; width: 30px;"></div>
    `;

    productsContainer.appendChild(skeletonElement);
  }
};

// Function to fetch and display products
const fetchProducts = async () => {
  const spinner = document.getElementById('loading-spinner');
  spinner.style.display = 'block'; // Show spinner

  showLoadingSkeleton(); // Show loading skeleton

  try {
    const response = await fetch('https://fakestoreapi.com/products'); // Replace with your API endpoint
    products = await response.json();
    totalPages = Math.ceil(products.length / itemsPerPage);

    renderProducts(products);
    renderFilters(products);
    updateTotalResults(products.length);

    // Show the "Load More" button if there are more products to load
    if (products.length > itemsPerPage) {
      document.getElementById('load-more').style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '<p>Sorry, could not reach the server.</p>';
  } finally {
    spinner.style.display = 'none'; // Hide spinner
  }
};

// Function to render products
const renderProducts = (products) => {
  const productsContainer = document.getElementById('products');
  productsContainer.innerHTML = ''; // Clear existing products

  if (products.length === 0) {
    productsContainer.innerHTML = '<p>There are no products to display.</p>';
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedProducts = products.slice(0, end);

  paginatedProducts.forEach((product) => {
    const productElement = document.createElement('div');
    productElement.classList.add('product');
    productElement.style.textAlign = 'left';

    productElement.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="product-image">
      <div class="product-details">
        <span class="product-title">${product.title}</span>
        <span style="font-weight: bold;">$${product.price}</span>
        <span class="wishlist-icon">♡</span>
      </div>
    `;

    productsContainer.appendChild(productElement);
  });
};

// Function to load more products
const loadMoreProducts = () => {
  currentPage++;
  renderProducts(products);

  // Hide the "Load More" button if all products are loaded
  if (currentPage >= totalPages) {
    document.getElementById('load-more').style.display = 'none';
  }
};

// Event listener for the "Load More" button
document
  .getElementById('load-more')
  .addEventListener('click', loadMoreProducts);

// Function to render filters
const renderFilters = (products) => {
  const categories = [...new Set(products.map((product) => product.category))];
  const categoryFiltersContainer = document.getElementById('category-filters');
  categoryFiltersContainer.innerHTML = ''; // Clear existing filters

  categories.forEach((category) => {
    const filterElement = document.createElement('li');
    filterElement.innerHTML = `
      <input type="checkbox" id="${category}" name="${category}" value="${category}">
      <label for="${category}">${category}</label>
    `;
    categoryFiltersContainer.appendChild(filterElement);
  });

  // Add event listeners to category checkboxes
  document
    .querySelectorAll('#category-filters input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener('change', filterProducts);
    });

  // Add event listeners to price range checkboxes
  document
    .querySelectorAll('#price-filters input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener('change', filterProducts);
    });
};

// Function to filter products based on selected categories, price ranges, and search query
const filterProducts = () => {
  const selectedCategories = Array.from(
    document.querySelectorAll(
      '#category-filters input[type="checkbox"]:checked'
    )
  ).map((checkbox) => checkbox.value);

  const selectedPriceRanges = Array.from(
    document.querySelectorAll('#price-filters input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.value);

  const searchQuery = document.getElementById('search-bar').value.toLowerCase();

  let filteredProducts = products;

  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((product) =>
      selectedCategories.includes(product.category)
    );
  }

  if (selectedPriceRanges.length > 0) {
    filteredProducts = filteredProducts.filter((product) => {
      return selectedPriceRanges.some((range) => {
        const [min, max] = range.split('-').map(Number);
        return product.price >= min && (max ? product.price <= max : true);
      });
    });
  }

  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) =>
      product.title.toLowerCase().includes(searchQuery)
    );
  }

  currentPage = 1; // Reset to first page after filtering
  renderProducts(filteredProducts);
  updateTotalResults(filteredProducts.length);
};

// Function to update total results
const updateTotalResults = (count) => {
  document.getElementById('total-results').textContent = `${count} Results`;
};

// Function to sort products by price
const sortProducts = (event) => {
  const sortBy = event.target.value || event.target.dataset.sort;
  let sortedProducts = [...products];

  if (sortBy === 'high') {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'low') {
    sortedProducts.sort((a, b) => a.price - b.price);
  }

  renderProducts(sortedProducts);
};

const clearFilters = () => {
  // Clear category filters
  document
    .querySelectorAll('#category-filters input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  // Clear price range filters
  document
    .querySelectorAll('#price-filters input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  // Clear search bar
  document.getElementById('search-bar').value = '';

  // Reset products display
  filterProducts();
};

// Function to handle window resize
const handleResize = () => {
  const filtersPanel = document.getElementById('filters-panel');
  const closeButton = document.getElementById('close-button');
  const path = document.getElementById('filter-route');
  const clearFilter = document.getElementById('clear-filters');
  if (window.innerWidth >= 769) {
    filtersPanel.style.display = 'block'; // Ensure the filter panel is displayed on desktop
    closeButton.style.display = 'none'; // Ensure the close button is not displayed on desktop
    path.style.display = 'block'; // Ensure the path is displayed on desktop
    clearFilter.style.display = 'none'; // Ensure the clear all button is not displayed on desktop
  } else {
    filtersPanel.style.display = 'none'; // Hide the filter panel on mobile
    closeButton.style.display = 'block'; // Enable the close button on mobile
    path.style.display = 'none'; // Hide the path on mobile
    clearFilter.style.display = 'block'; // Enable the clear all button on mobile
  }
};

// Add event listener for window resize
window.addEventListener('resize', handleResize);

// Event listeners for filter panel
document.getElementById('filterResults').addEventListener('click', () => {
  document.getElementById('filter-route').style.display = 'none';
  document.getElementById('filters-panel').style.display = 'block';
  document.getElementById('filter-price-section').style.display = 'block';
});

document.getElementById('close-button').addEventListener('click', () => {
  document.getElementById('filters-panel').style.display = 'none';
});

document.getElementById('see-results').addEventListener('click', () => {
  document.getElementById('filters-panel').style.display = 'none';
  filterProducts();
});

// Event listener for the clear filters button
document
  .getElementById('clear-filters')
  .addEventListener('click', clearFilters);

// Event listener for sort by price dropdown
document
  .getElementById('sort-by-price')
  .addEventListener('change', sortProducts);

// Event listeners for sort panel
document.getElementById('sort-button').addEventListener('click', () => {
  document.getElementById('sort-panel').style.display = 'block';
});

document.getElementById('close-sort-button').addEventListener('click', () => {
  document.getElementById('sort-panel').style.display = 'none';
});

document.querySelectorAll('.sort-option').forEach((button) => {
  button.addEventListener('click', (event) => {
    sortProducts(event);
    document.getElementById('sort-panel').style.display = 'none';
  });
});

// Event listener for search bar
document.getElementById('search-bar').addEventListener('input', filterProducts);

// Initial check on page load
handleResize();
fetchProducts();
