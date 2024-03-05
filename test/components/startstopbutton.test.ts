import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@components/startstopbutton";
import { StartStopButton } from "@components/startstopbutton";

import EventBus from "@shared/eventbus";
import {
  ReadyBusyEvent,
  ServerOffsetEvent,
  TimeSignalStateChangeEvent,
} from "@shared/events";
import RadioTimeSignal, { TimeSignalState } from "@shared/radiotimesignal";
import "@shared/styles.css";

import { FakeAppSettings, delay } from "@test/utils";

const FakeRadioTimeSignal = {
  start: vi.spyOn(RadioTimeSignal, "start"),
  stop: vi.spyOn(RadioTimeSignal, "stop"),
  state: vi.spyOn(RadioTimeSignal, "state", "get").mockReturnValue("idle"),
} as const;

describe("Start-stop button", () => {
  let startStopButton: StartStopButton;
  let innerButton: HTMLButtonElement;

  beforeEach(async () => {
    startStopButton = document.createElement("start-stop-button");
    startStopButton.setAttribute("classes", "foo bar");
    document.body.appendChild(startStopButton);
    await delay();
    innerButton = startStopButton.querySelector("button.btn")!;
  });

  afterEach(() => {
    startStopButton.remove();
    FakeAppSettings.get.mockClear();
    FakeRadioTimeSignal.start.mockReset();
    FakeRadioTimeSignal.stop.mockReset();
  });

  it("renders with defaults", () => {
    expect(innerButton.textContent).toMatch("loading");
    expect(innerButton.classList).toContain("btn-disabled");
  });

  describe("renders according to waveform generator state", async () => {
    beforeEach(async () => {
      EventBus.publish(ReadyBusyEvent, true);
      await delay();
    });

    afterEach(() => {
      FakeRadioTimeSignal.state.mockReturnValue("idle");
    });

    it("idle", () => {
      expect(innerButton.textContent).toMatch("Start JJY60");
      expect(innerButton.classList).toContain("btn-success");
      expect(innerButton.classList).not.toContain("btn-error");
      expect(innerButton.classList).not.toContain("btn-disabled");
    });

    it("startup, reqparams, loadparams", async () => {
      const states: TimeSignalState[] = ["startup", "reqparams", "loadparams"];
      for (let i = 0; i < states.length; i++) {
        /* eslint-disable no-await-in-loop */
        FakeRadioTimeSignal.state.mockReturnValue(states[i]);
        EventBus.publish(TimeSignalStateChangeEvent);
        await delay();
        expect(innerButton.textContent).toMatch("Stop JJY60");
        expect(innerButton.classList).not.toContain("btn-success");
        expect(innerButton.classList).toContain("btn-error");
        expect(innerButton.classList).not.toContain("btn-disabled");
      }
    });

    it("fadein, running, fadeout", async () => {
      const states: TimeSignalState[] = ["fadein", "running", "fadeout"];
      for (let i = 0; i < states.length; i++) {
        /* eslint-disable no-await-in-loop */
        FakeRadioTimeSignal.state.mockReturnValue(states[i]);
        EventBus.publish(TimeSignalStateChangeEvent);
        await delay();
        expect(innerButton.textContent).toMatch("Stop JJY60");
        expect(innerButton.classList).not.toContain("btn-success");
        expect(innerButton.classList).toContain("btn-error");
        expect(innerButton.classList).not.toContain("btn-disabled");
      }
    });

    it("suspend", async () => {
      FakeRadioTimeSignal.state.mockReturnValue("suspend");
      EventBus.publish(TimeSignalStateChangeEvent);
      await delay();
      expect(innerButton.textContent).toMatch("Stopping JJY60");
      expect(innerButton.classList).not.toContain("btn-success");
      expect(innerButton.classList).not.toContain("btn-error");
      expect(innerButton.classList).toContain("btn-disabled");
    });
  });

  describe("handles ReadyBusyEvent", () => {
    it("gets settings upon true", async () => {
      EventBus.publish(ReadyBusyEvent, true);
      await delay();
      expect(innerButton.textContent).toMatch("Start JJY60");
    });

    it("stops playback upon false", () => {
      EventBus.publish(ReadyBusyEvent, false);
      expect(FakeRadioTimeSignal.stop).toHaveBeenCalled();
    });
  });

  describe("handles TimeSignalStateChangeEvent", () => {
    it("always rerenders", () => {
      const spy = vi.spyOn(startStopButton, "requestUpdate");
      EventBus.publish(TimeSignalStateChangeEvent);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("handles ServerOffsetEvent", () => {
    it("saves server offset", () => {
      EventBus.publish(ServerOffsetEvent, -1234);
      innerButton.click();
      expect(FakeRadioTimeSignal.start).toHaveBeenCalled();
      const { offset } = FakeRadioTimeSignal.start.mock.lastCall![0];
      expect(offset).toBe(-2468);
    });
  });

  describe("toggles playback upon click", () => {
    beforeEach(() => {
      innerButton.click();
    });

    it("starts playback if currently stopped", () => {
      expect(FakeRadioTimeSignal.start).toHaveBeenCalled();
      expect(FakeRadioTimeSignal.stop).not.toHaveBeenCalled();
    });

    it("passes params to waveform generator", () => {
      const { stationIndex, jjyKhzIndex, offset, dut1, noclip } =
        FakeRadioTimeSignal.start.mock.lastCall![0];
      expect(stationIndex).toBe(2);
      expect(jjyKhzIndex).toBe(1);
      expect(offset).toBe(-1234);
      expect(dut1).toBe(123);
      expect(noclip).toBe(false);
    });

    it("stops playback if currently started", () => {
      FakeRadioTimeSignal.state.mockReturnValueOnce("running");
      innerButton.click();
      expect(FakeRadioTimeSignal.stop).toHaveBeenCalled();
    });
  });
});
