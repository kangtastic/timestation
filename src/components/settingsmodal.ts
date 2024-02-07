import { html } from "lit";
import { customElement, query } from "lit/decorators.js";
import AppSettings from "../shared/appsettings";
import BaseElement from "../shared/element";
import { SettingsEvent, SettingsReadyEvent } from "../shared/events";

@customElement("settings-modal")
export class SettingsModal extends BaseElement {
  @query("settings-modal dialog.modal", true)
  private accessor dialog!: HTMLDialogElement;

  showModal() {
    this.publish(SettingsReadyEvent, false);
    this.dialog.showModal();
  }

  #closeModal() {
    this.publish(SettingsEvent, "close");
    this.publish(SettingsReadyEvent, true);
  }

  #clickSave() {
    this.publish(SettingsEvent, "save");
  }

  protected render() {
    return html`
      <dialog
        class="modal modal-bottom sm:modal-middle"
        @close=${this.#closeModal}
      >
        <div class="modal-box max-h-screen flex flex-col gap-4">
          <form class="flex items-center mb-8" method="dialog">
            <h3 class="grow font-bold text-xl sm:text-2xl">Settings</h3>

            <!-- Invisible dummy button takes autofocus when modal is opened -->
            <button></button>

            <button
              class="btn btn-sm btn-ghost hover:bg-transparent"
              @click=${AppSettings.reset}
            >
              Reset All
            </button>
          </form>

          <locale-settings></locale-settings>
          <station-settings></station-settings>
          <offset-settings></offset-settings>
          <advanced-settings></advanced-settings>

          <form class="flex gap-4 items-center mt-8" method="dialog">
            <div class="grow"></div>
            <button class="btn" @click=${this.#clickSave}>Save Settings</button>
            <button class="btn">Cancel</button>
          </form>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-modal": SettingsModal;
  }
}
