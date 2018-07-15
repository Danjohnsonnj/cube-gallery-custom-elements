class FlipGallery extends HTMLElement {
  static get observedAttributes() {
    return [
      'columns',
      'item-height',
      'gallery-color',
      'caption-bg-color',
      'caption-text-color',
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.setGalleryProperties()
  }

  constructor() {
    super()
    this.gallery = this.createGallery()
    this.styleEl = this.createStyleEl()

    this.appendGallery()
    this.bindEvents()
  }
  
  createGallery() {
    const gallery = document.createElement("div")
    gallery.className = "gallery"
    return gallery
  }

  filterItems(items) {
    return Array.from(items).filter(i => {
      return i instanceof HTMLImageElement
    })
  }

  createStyleEl() {
    const styleEl = document.createElement('style')
    styleEl.innerHTML = `
      ::slotted(img) {
        display: none;
      }

      :host .gallery {
        /* Set these from the properties on the "flip-gallery" */
        --gallery-color: #121212;
        --caption-bg-color: #4d4d4d;
        --caption-text-color: #b8b8b8;  
      }
      
      /* Some day CSS4 color functions will be in browsers, and we can
          just use the "gallery-color" attribute on the "flip-gallery" */
      @supports (color: color(var(--gallery-color) contrast(45%))) {
        :host .gallery {
          --caption-bg-color: color(var(--gallery-color) lightness(30%) alpha(85%));
          --caption-text-color: color(var(--gallery-color) contrast(45%));
        }
      }
      
      
      :host .gallery {
        --columns: 3;
        --item-height: 600px;
        --trans-duration: 1s;
        --trans-duration-mod: 0.7s;
        --trans-curve: cubic-bezier(0.65, -0.25, 0.35, 1.25);
      }
      
      :host,
      :host * {
        box-sizing: border-box;
      }
      
      :host .gallery {
        overflow: hidden;
        min-height: 100vh;
        background: var(--gallery-color);
        font: 20px/2em sans-serif;
        display: grid;
        grid-template-columns: repeat(var(--columns), 1fr);
        grid-template-rows: min-content;
        grid-gap: 1vmin;
        padding: 1vmin;
      }
      
      :host .gallery-item {
        cursor: all-scroll;
        background-color: transparent;
      }
        
      :host figure {
        width: 100%;
        height: var(--item-height);
        margin: 0;
        position: relative;
        transition-property: transform;
        transition-duration: var(--trans-duration);
        transition-timing-function: var(--trans-curve);
      }    
      
      :host figure img {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 50%;
        transition-property: filter;
        transition-duration: var(--trans-duration-mod);
        transition-timing-function: var(--trans-curve);
        filter: brightness(1);
      }
          
      :host figcaption {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--caption-bg-color);
        display: inline-flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        text-align: center;
        border: 20px solid transparent;
      }  
      
      :host figcaption > * {
        display: block;
        color: var(--caption-text-color);
        word-wrap: break-word;
        word-break: break-all;
      }
      
      @media screen and (max-width: 600px) {
        :host .gallery {
          font-size: 12px;
          --item-height: 100vmin !important;
        }
      }
      
      
      /*    3-D stuff */
      :host .gallery-item {
        perspective: var(--item-height);
      }
      
      :host figure {
        z-index: -1;
        transform-style: preserve-3d;
        transform: translateZ(calc(-0.5 * var(--item-height)));
      }
      
      :host img {
        transform: rotateY(0deg) translateZ(calc(0.5 * var(--item-height)));
      }
      
      :host figcaption {
        backface-visibility: hidden;
        transform: rotateX(90deg) translateZ(calc(0.5 * var(--item-height)));
      }


      /* transition-style = "classic" (default) */
      :host .gallery-item:hover figure {
        z-index: 2;
        transform: translateZ(calc(-0.5 * var(--item-height))) rotateX(-90deg);
      }

      /* transition-style = "push" */
      :host([transition-style="push"]) .gallery-item figcaption {
        background-color: var(--caption-bg-color-push);
        transform: rotateX(90deg) translateZ(calc(0.7 * var(--item-height)));
        transition-property: all;
        transition-duration: var(--trans-duration);
        transition-timing-function: var(--trans-curve);
      }
      
      :host([transition-style="push"]) .gallery-item img {
        transform: rotateY(0deg) translateZ(calc(0 * var(--item-height)));
        transition-property: all;
        transition-duration: var(--trans-duration);
        transition-delay: calc(var(--trans-duration-mod) * 0.25);
      }
      
      :host([transition-style="push"]) .gallery-item:hover figcaption {
        transition-delay: calc(var(--trans-duration-mod) * 0.25);
        transform: rotateX(0deg);
      }

      :host([transition-style="push"]) .gallery-item:hover img {
        filter: brightness(0.2);
        transition-delay: 0s;
        transform: translateZ(calc(-0.2 * var(--item-height)));
      }

      :host([transition-style="push"]) .gallery-item figure {
        transform: none;
      }
    `
    return styleEl
  }
  
  setGalleryProperties() {
    const attrs = this.getAttributeNames() 
    attrs.forEach(a => {
      this.gallery.style.setProperty(`--${a}`, this.getAttribute(a))
    })
    let figcolor = this.gallery.style.getPropertyValue('--caption-bg-color')
    if (figcolor.includes('#', 0)) {
      this.gallery.style.setProperty('--caption-bg-color-push', `${figcolor}85`)
    }
  }
  
  appendItems(items) {
    items = Array.from(items).filter(i => {
      return i instanceof HTMLImageElement
    })

    items.forEach(item => {
      const itemElement = this.createItem(item)
      this.gallery.appendChild(itemElement)
    })
  }

  createItem(item) {
    const itemElement = document.createElement("div")
    itemElement.className = "gallery-item"
    itemElement.innerHTML = `
      <figure class="image-wrapper">
        <figcaption>
          <div>Photo by ${item.dataset.creditName}</div>
          <a href="${item.dataset.creditLink}" target="_blank">${item.dataset.creditLink}</a>
        </figcaption>
      </figure>
    `
    itemElement.querySelector('figure').appendChild(item)
    return itemElement
  }
  
  appendGallery() {
    let shadowRoot = this.attachShadow({mode: 'open'})
    shadowRoot.appendChild(this.styleEl)
    this.slotEl = document.createElement('slot')
    this.gallery.appendChild(this.slotEl)
    shadowRoot.appendChild(this.gallery)
    this.items = this.filterItems(this.slotEl.assignedNodes())
  }

  bindEvents() {
    this.slotEl.addEventListener('slotchange', e => {
      this.appendItems(this.slotEl.assignedNodes())
    });
    this.appendItems(this.slotEl.assignedNodes())
  }

}
if ('customElements' in window) {
  customElements.define('flip-gallery', FlipGallery)
} else {
  const tooBad = document.createElement('div')
  tooBad.style.cssText = 'background-color: #000; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: #fff; font-family: monospace; font-size: 5vmin;'
  tooBad.innerHTML = '<p>This browser does not support Custom&nbsp;Elements.</p><p>Check out the support <a href="https://caniuse.com/#feat=custom-elementsv1" target="_blank">here</a>.</p>'
  document.querySelector('flip-gallery').replaceWith(tooBad)
}
