// Βρες το κουμπί αναζήτησης και το input πεδίο
const searchButton = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsTable = document.getElementById('resultsTable');  // Το tbody ή το container όπου θα βάζεις τα προϊόντα

// Συνάρτηση για καθάρισμα του πίνακα αποτελεσμάτων
function clearTable() {
  resultsTable.innerHTML = '';
}

// Συνάρτηση που δημιουργεί μία γραμμή προϊόντος στον πίνακα
function addProductRow(product) {
  const row = document.createElement('tr');

  // Φτιάχνουμε τα κελιά με τα πεδία του προϊόντος, πχ όνομα, εικόνα, περιγραφή, likes
  const nameCell = document.createElement('td');
  nameCell.textContent = product.name;

  const imgCell = document.createElement('td');
  const img = document.createElement('img');
  img.src = product.photo;  // φαντάζομαι το πεδίο λέγεται photo
  img.alt = product.name;
  img.width = 100; // για παράδειγμα
  imgCell.appendChild(img);

  const descCell = document.createElement('td');
  descCell.textContent = product.description;

  const likesCell = document.createElement('td');
  likesCell.textContent = product.likes;

  // Προσθήκη κελιών στη σειρά
  row.appendChild(nameCell);
  row.appendChild(imgCell);
  row.appendChild(descCell);
  row.appendChild(likesCell);

  resultsTable.appendChild(row);
}

// Συνάρτηση που τρέχει το GET request στο /search
async function searchProducts() {
  const name = searchInput.value.trim();

  try {
    const response = await fetch(`http://127.0.0.1:5000/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const products = await response.json();

    clearTable();

    if (products.length === 0) {
      // Μπορείς να βάλεις μήνυμα "Δεν βρέθηκαν προϊόντα"
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4; // αριθμός στηλών του πίνακα
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

// Event listener για το κουμπί αναζήτησης
searchButton.addEventListener('click', (e) => {
  e.preventDefault();
  searchProducts();
});
function addProductRow(product) {
  const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  nameCell.textContent = product.name;

  const imgCell = document.createElement('td');
  const img = document.createElement('img');
  img.src = product.photo;
  img.alt = product.name;
  img.width = 100;

  // Προσθήκη click event στην εικόνα
  img.addEventListener('click', async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: product._id }),  // Υποθέτω το id είναι _id όπως στη MongoDB
      });

      if (!response.ok) throw new Error('Failed to like product');

      // Αύξησε τα likes τοπικά και ενημέρωσε το κελί
      product.likes += 1;
      likesCell.textContent = product.likes;
    } catch (error) {
      console.error('Error liking product:', error);
    }
  });

  imgCell.appendChild(img);

  const descCell = document.createElement('td');
  descCell.textContent = product.description;

  const likesCell = document.createElement('td');
  likesCell.textContent = product.likes;

  row.appendChild(nameCell);
  row.appendChild(imgCell);
  row.appendChild(descCell);
  row.appendChild(likesCell);

  resultsTable.appendChild(row);
}
async function loadPopularProducts() {
  try {
    const response = await fetch('http://127.0.0.1:5000/popular-products');
    if (!response.ok) throw new Error('Failed to fetch popular products');
    
    const products = await response.json();
    const slideshowContainer = document.getElementById('slideshow');

    // Καθαρίζουμε το container αν έχει περιεχόμενο
    slideshowContainer.innerHTML = '';

    products.forEach(product => {
      const slide = document.createElement('div');
      slide.className = 'slide';

      const img = document.createElement('img');
      img.src = product.photo;
      img.alt = product.name;
      img.style.width = '300px';  // ρύθμισε όπως θες

      const caption = document.createElement('p');
      caption.textContent = product.name;

      slide.appendChild(img);
      slide.appendChild(caption);
      slideshowContainer.appendChild(slide);
    });

    // Εδώ μπορείς να προσθέσεις λογική για αυτόματο ή χειροκίνητο slideshow
    startSlideshow();

  } catch (error) {
    console.error('Error loading popular products:', error);
  }
}

function startSlideshow() {
  const slides = document.querySelectorAll('#slideshow .slide');
  let currentIndex = 0;

  slides.forEach((slide, i) => {
    slide.style.display = i === 0 ? 'block' : 'none';
  });

  setInterval(() => {
    slides[currentIndex].style.display = 'none';
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].style.display = 'block';
  }, 3000); // αλλάζει κάθε 3 δευτερόλεπτα
}

// Κάλεσε τη φόρτωση όταν φορτώσει η σελίδα
window.addEventListener('DOMContentLoaded', loadPopularProducts);
