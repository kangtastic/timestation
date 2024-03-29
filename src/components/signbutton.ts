import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import BaseElement, { stringArrayConverter } from "@shared/element";
import { svgIcons } from "@shared/icons";

@customElement("sign-button")
export class SignButton extends BaseElement {
  @property({ converter: stringArrayConverter, reflect: true })
  accessor classes: string[] = [];

  @property({ type: Boolean, reflect: true })
  accessor negative = false;

  #click() {
    this.negative = !this.negative;
  }

  protected render() {
    const entries = this.classes.map((cls) => [cls, true]);
    const classes = classMap(Object.fromEntries(entries));
    return html`
      <button class=${classes} type="button" @click=${this.#click}>
        <span class="size-8">
          ${this.negative ? svgIcons.remove : svgIcons.add}
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sign-button": SignButton;
  }
}
