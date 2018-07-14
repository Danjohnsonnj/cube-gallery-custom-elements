class FlipGallery extends HTMLElement {
  static get observedAttributes() {
    return [
      'item-width',
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
          --caption-bg-color: color(var(--gallery-color) lightness(30%));
          --caption-text-color: color(var(--gallery-color) contrast(45%));
        }
      }
      
      
      :host .gallery {
        --item-width: 800px;
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
        min-height: 100vh;
        background: var(--gallery-color);
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-items: center;
        font: 20px/2em sans-serif;
        
      }
      
      :host .gallery-item {
        flex-basis: var(--item-width);
        margin-bottom: calc(0.1 * var(--item-height));
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
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 50%;
        backface-visibility: hidden;
        transition-property: filter;
        transition-duration: var(--trans-duration-mod);
        transition-timing-function: var(--trans-curve);
        filter: brightness(1);
      }
          
      :host figcaption {
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
        }
      }
      
      
      /*    3-D stuff */
      :host .gallery-item {
        perspective: var(--item-width);
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
      
      :host .gallery-item:hover figure,
      :host .gallery-item.show-caption figure {
        z-index: 2;
        transform: translateZ(calc(-0.5 * var(--item-height))) rotateX(-90deg);
      }
      :host .gallery-item:hover img,
      :host .gallery-item.show-caption img {
        filter: brightness(0.2);
      }
    `
    return styleEl
  }
  
  setGalleryProperties() {
    const attrs = this.getAttributeNames() 
    attrs.forEach(a => {
      this.gallery.style.setProperty(`--${a}`, this.getAttribute(a))          
    })
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
    
  }

}
customElements.define('flip-gallery', FlipGallery)
