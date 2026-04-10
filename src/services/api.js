import axios from "axios";
import {
  getDatasetId,
  getProductDatasetId,
  saveDatasetContext,
  saveProductDatasetContext,
  saveProductUploadMeta,
  saveUploadMeta,
} from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 15000,
});

const getRequestConfigWithDataset = () => {
  const datasetId = getDatasetId();

  if (!datasetId) {
    return {};
  }

  return {
    params: {
      datasetId,
    },
  };
};

const getRequestConfigWithProductDataset = (params = {}) => {
  const datasetId = getProductDatasetId();
  return {
    params: {
      ...(datasetId ? { datasetId } : {}),
      ...params,
    },
  };
};

export const uploadDataset = async (file) => {
  saveUploadMeta(file);

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 180000,
  });

  saveDatasetContext({
    datasetId: data?.datasetId,
    uploadMeta: data?.uploadMeta,
  });

  return data;
};

export const uploadProductDataset = async (file) => {
  saveProductUploadMeta(file);

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/upload-product", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000,
  });

  saveProductDatasetContext({
    datasetId: data?.datasetId,
    uploadMeta: data?.uploadMeta,
  });

  return data;
};

export const getPreviewData = async () => {
  const { data } = await api.get("/preview", getRequestConfigWithDataset());
  return data;
};

export const getDashboardData = async () => {
  const { data } = await api.get("/dashboard", getRequestConfigWithDataset());
  return data;
};

export const getAnalysisResults = async () => {
  const { data } = await api.get("/analyze", getRequestConfigWithDataset());
  return data;
};

export const getClusteringOutput = async () => {
  const { data } = await api.get("/results", getRequestConfigWithDataset());
  return data;
};

export const getInsightsData = async () => {
  const { data } = await api.get("/insights", getRequestConfigWithDataset());
  return data;
};

export const getProductAnalysisData = async ({
  forecastPeriods = 12,
  frequency = "auto",
  forceRefresh = false,
} = {}) => {
  const requestConfig = getRequestConfigWithProductDataset({
    forecastPeriods,
    frequency,
    forceRefresh,
  });

  const { data } = await api.get(
    "/product-analysis",
    {
      ...requestConfig,
      timeout: 300000,
    }
  );
  return data;
};
