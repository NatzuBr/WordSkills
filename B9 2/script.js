const container = document.querySelector('.comparador');
const slider = container.querySelector('input');

slider.addEventListener('input', (e) => {
  container.style.setProperty('--posicao', `${e.target.value}%`);
});