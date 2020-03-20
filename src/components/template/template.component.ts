import { RenderingContextV2 } from '@acoustic-content-sdk/api';
import { ACOUSTIC_LOGGER_SERVICE} from '@acoustic-content-sdk/web-components-services';

import template from './template.html';

const logger = ACOUSTIC_LOGGER_SERVICE.get('TemplateComponent');

export class TemplateComponent extends HTMLElement {

    set renderingContext(value: RenderingContextV2) {
        console.log('TemplateComponent', 'renderingContext', value);
    }

    set layoutMode(value: string) {
        console.log('TemplateComponent', 'layoutMode', value);
    }

    constructor() {
        super();        

    }

    connectedCallback() {
        this.innerHTML = template;
    }
}