from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request

router = APIRouter(tags=["analytics"])


def _load_dataset(request: Request, dataset_id: str | None) -> dict[str, Any]:
    repository = request.app.state.dataset_repository
    dataset = repository.get_dataset(dataset_id=dataset_id)

    if dataset is None:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found. Upload a file first and retry.",
        )

    return dataset


@router.get("/preview")
def get_preview_data(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_dataset(request, dataset_id)
    return dataset["preview"]


@router.get("/dashboard")
def get_dashboard_data(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_dataset(request, dataset_id)
    return dataset["dashboard"]


@router.get("/analyze")
def get_analysis_results(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_dataset(request, dataset_id)
    return dataset["analysis"]


@router.get("/results")
def get_results_data(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_dataset(request, dataset_id)
    return dataset["results"]


@router.get("/insights")
def get_insights_data(
    request: Request,
    dataset_id: str | None = Query(default=None, alias="datasetId"),
) -> dict[str, Any]:
    dataset = _load_dataset(request, dataset_id)
    return dataset["insights"]
