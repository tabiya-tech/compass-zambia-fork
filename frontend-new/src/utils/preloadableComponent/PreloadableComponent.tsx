import { lazy, FC } from "react";
import { isChunkLoadError } from "src/error/isChunkLoadError";

export type PreloadableComponent<T extends FC<any>> = T & {
  preload: () => Promise<{ default: T }>;
};

/**
 * Wraps a dynamic import factory to retry once on ChunkLoadError (e.g. transient network or stale cache).
 */
const withChunkLoadRetry = <T,>(factory: () => Promise<{ default: T }>): (() => Promise<{ default: T }>) => {
  return () =>
    factory().catch((error) => {
      if (isChunkLoadError(error)) {
        return factory();
      }
      throw error;
    });
};

/**
 * A higher order component that wraps a lazy loaded component and adds a preload function to it.
 * Only works with functional components that are exported as default.
 * Retries the import once if a ChunkLoadError occurs (e.g., after deployment or network blip).
 *
 * @param factory A function that returns a promise that resolves to the component.
 * @returns A component that can be lazy loaded and preloaded.
 * @example const MyComponent = lazyWithPreload(() => import("path/to/component"));
 * */
export function lazyWithPreload<T extends FC<any>>(factory: () => Promise<{ default: T }>): PreloadableComponent<T> {
  const wrappedFactory = withChunkLoadRetry(factory);
  const Component = lazy(wrappedFactory);
  const PreloadableComponent = Component as unknown as PreloadableComponent<T>;

  PreloadableComponent.preload = wrappedFactory;
  return PreloadableComponent;
}
