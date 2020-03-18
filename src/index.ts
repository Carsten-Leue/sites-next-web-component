import { RenderingContextV2 } from '@acoustic-content-sdk/api';

export class CarstensComponent extends HTMLElement {

    set renderingContext(value: RenderingContextV2) {
        console.log('CarstensComponent', 'renderingContext', value);
    }

    set layoutMode(value: string) {
        console.log('CarstensComponent', 'layoutMode', value);
    }

    constructor() {
        super();        

        console.log('CarstensComponent', 'Constructor');
    }

    connectedCallback() {
        
        console.log('CarstensComponent', 'connectedCallback');
    }

    disconnectedCallback() {
        console.log('CarstensComponent', 'disconnectCallback');
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        console.log('CarstensComponent', 'attributeChangedCallback', name, oldValue, newValue);

    }
}