const STORAGE_KEY = "cbpa-upload-context";

const getStoredContext = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

const persistContext = (nextContext) => {
  if (typeof window === "undefined") {
    return null;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextContext));
  return nextContext;
};

export const getUploadContext = () => getStoredContext();

export const getUploadMeta = () => getStoredContext()?.uploadMeta || null;

export const getDatasetId = () => getStoredContext()?.datasetId || null;

export const saveUploadMeta = (file) => {
  if (typeof window === "undefined" || !file) {
    return null;
  }

  const existing = getStoredContext() || {};
  const uploadMeta = {
    fileName: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
  };

  persistContext({
    ...existing,
    uploadMeta,
  });

  return uploadMeta;
};

export const saveDatasetContext = ({ datasetId, uploadMeta }) => {
  if (typeof window === "undefined") {
    return null;
  }

  const existing = getStoredContext() || {};

  return persistContext({
    ...existing,
    datasetId: datasetId || existing.datasetId || null,
    uploadMeta: uploadMeta || existing.uploadMeta || null,
  });
};

export const clearUploadContext = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
