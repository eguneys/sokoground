
export const createEl = (tagName, className) => {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  return el;
};

export const raf = (window.requestAnimationFrame || window.setTimeout).bind(window);
