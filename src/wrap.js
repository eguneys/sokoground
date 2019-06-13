import { createEl } from './util';

export default function wrap(element, state) {
  
  element.innerHTML = '';

  element.classList.add('sg-wrap');

  const container = createEl('sg-container');
  element.appendChild(container);

  const board = createEl('sg-board');
  container.appendChild(board);

  return {
    board,
    container
  };

}
