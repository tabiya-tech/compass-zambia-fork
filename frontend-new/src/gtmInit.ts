import { getGtmContainerId, getGtmEnabled } from "./envService";

export function initGTM() {
  const enabled = getGtmEnabled().toLowerCase() === "true";
  const containerId = getGtmContainerId();

  if (!enabled) {
    console.info("GTM is not enabled. Google Tag Manager will not be initialized.");
    return;
  }

  if (!containerId) {
    console.warn("GTM is enabled but container ID is not set. Google Tag Manager will not be initialized.");
    return;
  }

  console.info("Initializing Google Tag Manager");

  // Initialize dataLayer
  (window as any).dataLayer = (window as any).dataLayer || [];

  // Push initial GTM event
  (window as any).dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });

  // Inject GTM script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);

  // Inject GTM noscript iframe
  const noscript = document.createElement("noscript");
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(containerId)}`;
  iframe.height = "0";
  iframe.width = "0";
  iframe.style.display = "none";
  iframe.style.visibility = "hidden";
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);
}

/**
 * Pushes a custom event to the GTM dataLayer.
 * This is a no-op if GTM has not been initialized (dataLayer does not exist).
 */
export function pushToDataLayer(event: string, data?: Record<string, any>) {
  const dataLayer = (window as any).dataLayer;
  if (!dataLayer) return;
  dataLayer.push({ event, ...data });
}
