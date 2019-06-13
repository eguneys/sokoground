import { start } from './api';
import { configure } from './config';
import { defaults } from './state';

import * as events from './events';

import renderWrap from './wrap';
import render from './render';

import { loadLevels } from './fen';

export function app(element, config, onLoad) {

  const state = defaults();

  function redrawAll() {

    const elements = renderWrap(element, state);

    const redrawNow = () => {
      render(state);
    };

    state.dom = {
      elements,
      redreaw: redrawNow,
      redrawNow: redrawNow
    };

    redrawNow();
    state.dom.unbind = events.bindDocument(state, redrawAll);
  }

  loadLevels(levels => {
    state.levels = levels;

    configure(state, config || {});

    redrawAll();

    const api = start(state, redrawAll);

    onLoad(api);
  });
};
