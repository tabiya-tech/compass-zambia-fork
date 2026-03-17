export const isChunkLoadError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.name === "ChunkLoadError" || error.message.includes("Loading chunk");
  }
  return false;
};
