from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import APIRouter, HTTPException, Query, Request

from ..services.product_analysis import run_product_analytics

router = APIRouter(tags=["analytics"])


def _load_customer_dataset(request: Request, dataset_id: str | None) -> dict[str, Any]:
    repository = request.app.state.dataset_repository
    dataset = repository.get_dataset(dataset_id=dataset_id, dataset_type="customer")

    if dataset is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found. Upload a file first and retry.",
        )

    return dataset


def _load_product_dataset(request: Request, dataset_id: str | None) -> dict[str, Any]:
    repository = request.app.state.dataset_repository
    dataset = repository.get_dataset(dataset_id=dataset_id, dataset_type="product")

    if dataset is None:
        raise HTTPException(
            status_code=404,
            detail="Product dataset not found. Upload a product file first and retry.",
        )

    return dataset


def _load_product_analysis_frame(dataset: dict[str, Any]) -> pd.DataFrame:
    product_data = dataset.get("productData", {})
    artifact_paths = product_data.get("artifactPaths", {})

    candidate_paths = [
        artifact_paths.get("cleanedFilePath"),
        artifact_paths.get("processedFilePath"),
    ]

    for raw_path in candidate_paths:
        if not raw_path:
            continue

        file_path = Path(str(raw_path))
        if file_path.exists() and file_path.is_file():
            if file_path.suffix.lower() == ".csv":
                return pd.read_csv(file_path)
            if file_path.suffix.lower() in {".xls", ".xlsx"}:
                return pd.read_excel(file_path)

    cleaned_preview = product_data.get("cleanedPreviewRecords")
    if isinstance(cleaned_preview, list) and cleaned_preview:
        return pd.DataFrame(cleaned_preview)

    processed_preview = product_data.get("processedPreviewRecords")
    if isinstance(processed_preview, list) and processed_preview:
        return pd.DataFrame(processed_preview)

    legacy_records = product_data.get("records")
    if isinstance(legacy_records, list) and legacy_records:
        return pd.DataFrame(legacy_records)

    raise HTTPException(
        status_code=422,
        detail="No readable product dataset records found for analytics.",
    )


@router.get("/preview")
def get_preview_data(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_customer_dataset(request, dataset_id)
    return dataset["preview"]


@router.get("/dashboard")
def get_dashboard_data(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_customer_dataset(request, dataset_id)
    return dataset["dashboard"]


@router.get("/analyze")
def get_analysis_results(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_customer_dataset(request, dataset_id)
    return dataset["analysis"]


@router.get("/results")
def get_results_data(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_customer_dataset(request, dataset_id)
    return dataset["results"]


@router.get("/insights")
def get_insights_data(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_customer_dataset(request, dataset_id)
    return dataset["insights"]


@router.get("/product-analysis")
def get_product_analysis_data(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
    forecast_periods: int = Query(default=12, alias="forecastPeriods", ge=1, le=120),
    frequency: str = Query(default="auto"),
    force_refresh: bool = Query(default=False, alias="forceRefresh"),
) -> dict[str, Any]:
    frequency_key = frequency.strip().lower()
    if frequency_key not in {"auto", "daily", "monthly"}:
        raise HTTPException(
            status_code=400,
            detail="frequency must be one of: auto, daily, monthly",
        )

    dataset = _load_product_dataset(request, dataset_id)

    if (
        not force_refresh
        and dataset.get("productAnalysis")
        and frequency_key == "auto"
        and int(forecast_periods) == 12
    ):
        return dataset["productAnalysis"]

    frame = _load_product_analysis_frame(dataset)
    analysis_payload = run_product_analytics(
        frame=frame,
        forecast_periods=int(forecast_periods),
        frequency=frequency_key,
    )

    dataset["productAnalysis"] = analysis_payload
    dataset["updatedAt"] = datetime.now(timezone.utc)
    request.app.state.dataset_repository.save_dataset(dataset)
    return analysis_payload
