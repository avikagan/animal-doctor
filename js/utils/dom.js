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
