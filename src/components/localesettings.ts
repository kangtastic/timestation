import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import AppSettings from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import {
  LocaleSettingEvent,
  ReadyBusyEvent,
  SettingsEvent,
} from "../shared/events";
import { defaultLocale, knownLocales } from "../shared/locales";
import { ArrowDropdown } from "./arrowdropdown";
import { kLocaleSearchboxGroup } from "./localesearchbox";

@customElement("locale-settings")
export class LocaleSettings extends BaseElement {
  @property({ type: String, reflect: true })
  accessor locale = defaultLocale;

  @query("locale-settings arrow-dropdown", true)
  private accessor arrowDropdown!: ArrowDropdown;

  @registerEventHandler(SettingsEvent)
  handleSettings(eventType: string) {
    if (eventType === "save") this.#saveSettings();
    this.#closeCollapse();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
  }

  @registerEventHandler(LocaleSettingEvent)
  handleLocaleSetting(value: string) {
    this.locale = value;
    this.#closeCollapse();
  }

  #getSettings() {
    this.locale = AppSettings.get("locale");
    this.publish(LocaleSettingEvent, this.locale);
  }

  #saveSettings() {
    AppSettings.set("locale", this.locale);
  }

  #closeCollapse() {
    this.arrowDropdown.open = false;
  }

  protected render() {
    const displayName = knownLocales[this.locale]?.[0] ?? "Unknown locale";

    return html`
      <div class="flex flex-col">
        <div class="flex items-center h-12">
          <h3 class="font-bold text-lg sm:text-xl">Locale</h3>

          <info-dropdown
            class="grow"
            classes="max-w-[14rem] min-[440px]:max-w-max"
            .content=${html`
              <h4 class="font-bold">Locale</h4>
              <span class="text-sm float-left">
                Changes only how transmitted time is displayed.
              </span>
            `}
            grow
          ></info-dropdown>

          <arrow-dropdown
            classes="flex-nowrap after:shrink-0"
            .group=${kLocaleSearchboxGroup}
            .text=${html`${displayName}`}
          ></arrow-dropdown>
        </div>

        <collapse-setting
          .group=${kLocaleSearchboxGroup}
          .content=${html`<locale-searchbox></locale-searchbox>`}
        >
        </collapse-setting>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "locale-settings": LocaleSettings;
  }
}
