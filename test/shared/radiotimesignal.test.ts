import { describe, expect, it } from "vitest";

import EventBus from "@shared/eventbus";
import { VisualizerIconEvent } from "@shared/events";
import RadioTimeSignal from "@shared/radiotimesignal";

/*
 * We cannot rely upon creating an Audio Worklet thread from WASM in browser
 * tests. Without this, very little can be tested.
 */

describe("RadioTimeSignal", () => {
  it("is a singleton", () => {
    const Class = RadioTimeSignal.constructor as any;
    expect(() => new Class()).toThrow("RadioTimeSignal is a singleton class.");
  });

  it("starts in idle state", () => {
    expect(RadioTimeSignal.state).toBe("idle");
  });

  describe("handles VisualizerIconEvent", () => {
    it("takes canvas element from event data", () => {
      const canvas = document.createElement("canvas");
      EventBus.publish(VisualizerIconEvent, canvas);
      expect(RadioTimeSignal.canvas).toBe(canvas);
    });
  });
});
