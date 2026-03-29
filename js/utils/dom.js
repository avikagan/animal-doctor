export function el(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') element.className = value;
    else if (key === 'textContent') element.textContent = value;
    else if (key === 'innerHTML') element.innerHTML = value;
    else if (key.startsWith('on')) element.addEventListener(key.slice(2).toLowerCase(), value);
    else element.setAttribute(key, value);
  }
  for (const child of children) {
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else if (child) element.appendChild(child);
  }
  return element;
}

export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  if (screen) screen.classList.add('active');
  return screen;
}

export function clearElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

/**
 * Creates an animal image element with emoji fallback.
 * @param {object} animal - Animal data object (needs id and emoji fields)
 * @param {'default'|'sick'|'healthy'} variant - Which image to show
 * @param {string} sizeClass - CSS class for sizing ('emoji-large' or 'emoji-medium')
 */
export function animalImg(animal, variant = 'default', sizeClass = 'emoji-large') {
  const ext = variant === 'default' ? 'png' : 'gif';
  const src = `assets/images/${animal.id}/${variant}.${ext}`;

  const img = document.createElement('img');
  img.src = src;
  img.alt = animal.name;
  img.className = `animal-img ${sizeClass}`;
  img.draggable = false;

  // Fallback to emoji if image fails to load
  img.onerror = () => {
    const span = document.createElement('span');
    span.className = sizeClass;
    span.textContent = animal.emoji;
    img.replaceWith(span);
  };

  return img;
}
