async function loadPopularProductsForHomepage() {
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
      img.src = product.photo || product.image || 'images/default-product.jpg'; // fallback εικόνα
      img.alt = product.name;
      img.style.width = '100%';
      img.style.borderRadius = '10px';

      const caption = document.createElement('p');
      caption.textContent = product.name;
      caption.style.fontWeight = 'bold';
      caption.style.color = '#4B0082';
      caption.style.marginTop = '10px';

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

  if (slides.length === 0) return;

  slides.forEach((slide, i) => {
    slide.style.display = i === 0 ? 'block' : 'none';
  });

  setInterval(() => {
    slides[currentIndex].style.display = 'none';
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].style.display = 'block';
  }, 3000);
}

window.addEventListener('DOMContentLoaded', loadPopularProductsForHomepage);
