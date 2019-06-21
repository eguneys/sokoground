import { start } from './api';
import { configure } from './config';
import { defaults } from './state';

import * as events from './events';

import renderWrap from './wrap';
import render from './render';

import { loadLevels } from './fen';

export function app(element, config) {

  const state = defaults();

  configure(state, config || {});

  function redrawAll() {

    const elements = renderWrap(element, state);

    const redrawNow = () => {
      render(state);
    };

    state.dom = {
      elements,
      redraw: redrawNow,
      redrawNow: redrawNow
    };

    redrawNow();
    state.dom.unbind = events.bindDocument(state, redrawAll);
  }

  redrawAll();

  const api = start(state, redrawAll);

  return api;
};
