import "src/_test_utilities/consoleMock";

import { initGTM, pushToDataLayer } from "./gtmInit";
import { getGtmContainerId, getGtmEnabled } from "./envService";

jest.mock("./envService", () => ({
  getGtmContainerId: jest.fn(),
  getGtmEnabled: jest.fn(),
}));

describe("gtmInit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clean up any GTM artifacts from previous tests
    delete (window as any).dataLayer;
    document.head.querySelectorAll('script[src*="googletagmanager"]').forEach((el) => el.remove());
    document.body.querySelectorAll("noscript").forEach((el) => el.remove());
  });

  describe("initGTM", () => {
    test("should not initialize GTM when enabled is false", () => {
      // GIVEN GTM is not enabled
      const givenEnabled = "false";
      const givenContainerId = "GTM-TEST123";
      (getGtmEnabled as jest.Mock).mockReturnValue(givenEnabled);
      (getGtmContainerId as jest.Mock).mockReturnValue(givenContainerId);

      // WHEN initGTM is called
      initGTM();

      // THEN expect GTM to not be initialized
      expect((window as any).dataLayer).toBeUndefined();
      expect(document.head.querySelector('script[src*="googletagmanager"]')).toBeNull();
      expect(console.info).toHaveBeenCalledWith("GTM is not enabled. Google Tag Manager will not be initialized.");
    });

    test("should not initialize GTM when container ID is empty", () => {
      // GIVEN GTM is enabled but container ID is empty
      const givenEnabled = "true";
      const givenContainerId = "";
      (getGtmEnabled as jest.Mock).mockReturnValue(givenEnabled);
      (getGtmContainerId as jest.Mock).mockReturnValue(givenContainerId);

      // WHEN initGTM is called
      initGTM();

      // THEN expect GTM to not be initialized
      expect((window as any).dataLayer).toBeUndefined();
      expect(document.head.querySelector('script[src*="googletagmanager"]')).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        "GTM is enabled but container ID is not set. Google Tag Manager will not be initialized."
      );
    });

    test("should initialize GTM when enabled with a valid container ID", () => {
      // GIVEN GTM is enabled and container ID is set
      const givenContainerId = "GTM-TEST123";
      (getGtmEnabled as jest.Mock).mockReturnValue("true");
      (getGtmContainerId as jest.Mock).mockReturnValue(givenContainerId);

      // WHEN initGTM is called
      initGTM();

      // THEN expect dataLayer to be initialized
      expect((window as any).dataLayer).toBeDefined();
      expect((window as any).dataLayer.length).toBeGreaterThan(0);

      // AND expect the initial gtm.js event to be pushed
      const gtmEvent = (window as any).dataLayer.find((item: any) => item.event === "gtm.js");
      expect(gtmEvent).toBeDefined();
      expect(gtmEvent["gtm.start"]).toBeDefined();

      // AND expect the GTM script to be injected
      const script = document.head.querySelector('script[src*="googletagmanager"]') as HTMLScriptElement;
      expect(script).not.toBeNull();
      expect(script.src).toContain(`id=${givenContainerId}`);
      expect(script.async).toBe(true);

      // AND expect the noscript iframe to be injected
      const noscript = document.body.querySelector("noscript");
      expect(noscript).not.toBeNull();
      const iframe = noscript!.querySelector("iframe") as HTMLIFrameElement;
      expect(iframe).not.toBeNull();
      expect(iframe.src).toContain(`id=${givenContainerId}`);

      expect(console.info).toHaveBeenCalledWith("Initializing Google Tag Manager");
    });
  });

  describe("pushToDataLayer", () => {
    test("should push event to dataLayer when it exists", () => {
      // GIVEN dataLayer is initialized
      (window as any).dataLayer = [];

      // WHEN pushToDataLayer is called with an event
      const givenEvent = "user_login";
      const givenData = { method: "google" };
      pushToDataLayer(givenEvent, givenData);

      // THEN expect the event to be in the dataLayer
      expect((window as any).dataLayer).toContainEqual({
        event: givenEvent,
        method: "google",
      });
    });

    test("should be a no-op when dataLayer does not exist", () => {
      // GIVEN dataLayer is not initialized
      delete (window as any).dataLayer;

      // WHEN pushToDataLayer is called
      // THEN expect it to not throw
      expect(() => pushToDataLayer("user_login", { method: "email" })).not.toThrow();
    });
  });
});
