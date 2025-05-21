const searchButton = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsTable = document.getElementById('resultsTable');

function clearTable() {
  resultsTable.innerHTML = '';
}

function addProductRow(product) {
  const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  nameCell.textContent = product.name;

  const imgCell = document.createElement('td');
  const img = document.createElement('img');
  img.src = product.image;  // Αν χρειαστεί, άλλαξε σε product.image
  img.alt = product.name;
  img.width = 100;

  const descCell = document.createElement('td');
  descCell.textContent = product.description;

  const likesCell = document.createElement('td');
  likesCell.textContent = product.likes;

  img.addEventListener('click', async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: product._id }),
      });

      if (!response.ok) throw new Error('Failed to like product');

      product.likes += 1;
      likesCell.textContent = product.likes;
    } catch (error) {
      console.error('Error liking product:', error);
    }
  });

  imgCell.appendChild(img);
  row.appendChild(nameCell);
  row.appendChild(imgCell);
  row.appendChild(descCell);
  row.appendChild(likesCell);
  resultsTable.appendChild(row);
}

async function searchProducts() {
  const name = searchInput.value.trim();

  try {
    const response = await fetch(`http://127.0.0.1:5000/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const products = await response.json();
    clearTable();

    if (products.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'Δεν βρέθηκαν προϊόντα.';
      row.appendChild(cell);
      resultsTable.appendChild(row);
    } else {
      products.forEach(addProductRow);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

searchButton.addEventListener('click', (e) => {
  e.preventDefault();
  searchProducts();
});

async function loadPopularProducts() {
  try {
    const response = await fetch('http://127.0.0.1:5000/popular-products');
    if (!response.ok) throw new Error('Failed to fetch popular products');

    const products = await response.json();
    const slideshowContainer = document.getElementById('slideshow');
    slideshowContainer.innerHTML = '';

    products.forEach(product => {
      const slide = document.createElement('div');
      slide.className = 'slide';

      const img = document.createElement('img');
      img.src = product.photo;  // Αν χρειαστεί, άλλαξε σε product.image
      img.alt = product.name;
      img.style.width = '300px';

      const caption = document.createElement('p');
      caption.textContent = product.name;

      slide.appendChild(img);
      slide.appendChild(caption);
      slideshowContainer.appendChild(slide);
    });

    startSlideshow();
  } catch (error) {
    console.error('Error loading popular products:', error);
  }
}

function startSlideshow() {
  const slides = document.querySelectorAll('#slideshow .slide');
  let currentIndex = 0;

  if (slides.length === 0) return; // Αν δεν υπάρχουν slides, τερματίζουμε

  slides.forEach((slide, i) => {
    slide.style.display = i === 0 ? 'block' : 'none';
  });

  setInterval(() => {
    slides[currentIndex].style.display = 'none';
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].style.display = 'block';
  }, 3000);
}

window.addEventListener('DOMContentLoaded', () => {
  loadPopularProducts();  // Υπάρχει ήδη
  searchProducts();       // Εδώ καλείς την αναζήτηση χωρίς φίλτρο
});
