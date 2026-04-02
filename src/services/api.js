import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  analysisResults,
  clusteringOutput,
  dashboardData,
  insightsData,
  previewData,
} from "../utils/mockData";
import { getUploadMeta, saveUploadMeta } from "../utils/storage";

// Axios instance mirrors a real backend client, while the mock adapter keeps the UI runnable now.
const api = axios.create({
  baseURL: "https://mock-cbpa.local",
  timeout: 5000,
});

const mock = new MockAdapter(api, {
  delayResponse: 850,
});

let mocksInitialized = false;

const initializeMocks = () => {
  if (mocksInitialized) {
    return;
  }

  mock.onPost("/upload").reply(() => {
    const uploadMeta = getUploadMeta();

    return [
      200,
      {
        success: true,
        message: "Dataset uploaded and queued for analysis.",
        uploadMeta,
        preview: {
          rows: previewData.rows.length,
          columns: previewData.columns.length,
        },
      },
    ];
  });

  mock.onGet("/preview").reply(200, {
    ...previewData,
    uploadMeta: getUploadMeta(),
  });

  mock.onGet("/dashboard").reply(200, {
    ...dashboardData,
    uploadMeta: getUploadMeta(),
  });

  mock.onGet("/analyze").reply(200, analysisResults);

  mock.onGet("/results").reply(200, clusteringOutput);

  mock.onGet("/insights").reply(200, insightsData);

  mocksInitialized = true;
};

initializeMocks();

export const uploadDataset = async (file) => {
  saveUploadMeta(file);

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const getPreviewData = async () => {
  const { data } = await api.get("/preview");
  return data;
};

export const getDashboardData = async () => {
  const { data } = await api.get("/dashboard");
  return data;
};

export const getAnalysisResults = async () => {
  const { data } = await api.get("/analyze");
  return data;
};

export const getClusteringOutput = async () => {
  const { data } = await api.get("/results");
  return data;
};

export const getInsightsData = async () => {
  const { data } = await api.get("/insights");
  return data;
};
