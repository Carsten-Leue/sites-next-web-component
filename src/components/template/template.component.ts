import { RenderingContextV2 } from '@acoustic-content-sdk/api';
import { ACOUSTIC_LOGGER_SERVICE } from '@acoustic-content-sdk/web-components-services';

import template from './template.html';

const logger = ACOUSTIC_LOGGER_SERVICE.get('TemplateComponent');

export class TemplateComponent extends HTMLElement {
  set renderingContext(value: RenderingContextV2) {
    logger.info('renderingContext', value);
  }

  set layoutMode(value: string) {
    logger.info('layoutMode', value);
  }

  constructor() {
    super();
    logger.info('Constructing ...');
  }

  connectedCallback() {
    logger.info('connectedCallback');
    this.innerHTML = template;
  }
}
