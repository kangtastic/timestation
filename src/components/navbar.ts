import { html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import "@components/aboutmodal";
import { AboutModal } from "@components/aboutmodal";
import "@components/darktoggle";
import "@components/settingsmodal";
import { SettingsModal } from "@components/settingsmodal";

import BaseElement, { registerEventHandler } from "@shared/element";
import { ReadyBusyEvent } from "@shared/events";
import { svgIcons } from "@shared/icons";

@customElement("nav-bar")
export class NavBar extends BaseElement {
  @query("nav-bar .dropdown", true)
  private accessor dropdown!: HTMLDivElement;

  @query("nav-bar .dropdown [role=button].btn", true)
  private accessor menuButton!: HTMLDivElement;

  @query("nav-bar .dropdown [role=button].btn input", true)
  private accessor checkbox!: HTMLInputElement;

  @query("nav-bar about-modal", true)
  private accessor aboutModal!: AboutModal;

  @query("nav-bar settings-modal", true)
  private accessor settingsModal!: SettingsModal;

  @state()
  private accessor ready = false;

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    this.ready = ready;
  }

  @state()
  private set open(value: boolean) {
    if (value) {
      this.dropdown.setAttribute("open", "");
      this.checkbox.checked = true;
    } else {
      this.dropdown.removeAttribute("open");
      this.checkbox.checked = false;
      this.menuButton.blur();
    }
    this.#open = value;
  }

  private get open() {
    return this.#open;
  }

  #open = false;

  #clickMenu() {
    this.open = !this.open;
  }

  #clickAbout() {
    this.aboutModal.showModal();
    this.open = false;
  }

  #clickSettings() {
    this.settingsModal.showModal();
    this.open = false;
  }

  #clickGitHub() {
    this.open = false;
  }

  protected render() {
    const disabled = classMap({
      "pointer-events-none": !this.ready,
      "text-secondary": !this.ready,
    });

    return html`
      <div class="navbar sm:min-h-20">
        <div class="navbar-start">
          <div class="dropdown">
            <div
              class="btn btn-ghost p-0 size-12 sm:size-16 swap"
              role="button"
              tabindex="0"
              @click=${this.#clickMenu}
            >
              <input type="checkbox" />

              <span class="swap-off size-8 sm:size-10">${svgIcons.menu}</span>

              <span class="swap-on size-8 sm:size-10">${svgIcons.close}</span>
            </div>

            <ul
              class="p-2 drop-shadow menu dropdown-content z-[1] bg-base-100 rounded-box font-medium sm:text-lg"
            >
              <li>
                <a class="px-2" @click=${this.#clickAbout}>
                  <span class="flex sm:py-1 items-center">
                    <span class="size-6 sm:size-8">${svgIcons.help}</span>
                    <span class="mx-2">About</span>
                  </span>
                </a>
              </li>

              <li>
                <a class="px-2 ${disabled}" @click=${this.#clickSettings}>
                  <span class="flex sm:py-1 items-center">
                    <span class="size-6 sm:size-8">${svgIcons.settings}</span>
                    <span class="mx-2">Settings</span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  class="px-2"
                  href="https://www.github.com/"
                  target="_blank"
                  @click=${this.#clickGitHub}
                >
                  <span class="flex sm:py-1 items-center">
                    <span class="size-6 sm:size-8">${svgIcons.github}</span>
                    <span class="mx-2">GitHub</span>
                    <span class="size-4 sm:size-6">${svgIcons.open}</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="navbar-end">
          <dark-toggle class="pr-2 inline-flex drop-shadow-aura"></dark-toggle>
        </div>
      </div>

      <about-modal></about-modal>
      <settings-modal></settings-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-bar": NavBar;
  }
}
