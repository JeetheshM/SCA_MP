const STORAGE_KEY = "cbpa-upload-metadata";

export const getUploadMeta = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  return rawValue ? JSON.parse(rawValue) : null;
};

export const saveUploadMeta = (file) => {
  if (typeof window === "undefined" || !file) {
    return null;
  }

  const metadata = {
    fileName: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));

  return metadata;
};
