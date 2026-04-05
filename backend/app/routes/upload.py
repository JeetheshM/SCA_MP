from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from ..services.data_preprocessing import InputPreprocessor
from ..services.inference import run_segmentation
from ..services.insights import (
    build_analysis_payload,
    build_dashboard_payload,
    build_insights_payload,
    build_preview_payload,
    build_results_payload,
)
from ..services.preprocess import SUPPORTED_EXTENSIONS, build_customer_frame, read_tabular_file

router = APIRouter(tags=["upload"])


@router.post("/upload")
async def upload_dataset(request: Request, file: UploadFile = File(...)) -> dict:
    file_name = file.filename or ""
    extension = Path(file_name).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only CSV, XLS, and XLSX files are supported.")

    file_bytes = await file.read()

    try:
        input_preprocessor = InputPreprocessor()
        raw_frame, engineered_frame, engineered_input_array = input_preprocessor.load_uploaded_file(
            file_name,
            file_bytes,
        )
        customers, quality = build_customer_frame(raw_frame)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    request.app.state.last_uploaded_input_array = engineered_input_array
    request.app.state.last_uploaded_feature_frame = engineered_frame

    inference_artifacts = request.app.state.inference_artifacts
    inference_result = run_segmentation(
        customers,
        inference_artifacts,
        feature_frame=engineered_frame,
    )

    dataset_id = str(uuid4())
    upload_meta = {
        "fileName": file_name,
        "size": file.size if file.size is not None else len(file_bytes),
        "type": file.content_type or "application/octet-stream",
        "uploadedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }

    preview_payload = build_preview_payload(inference_result.customers, quality, upload_meta)
    dashboard_payload = build_dashboard_payload(
        inference_result.customers,
        upload_meta,
        quality,
        inference_result.segment_mix,
        inference_result.model_meta,
    )
    analysis_payload = build_analysis_payload(
        inference_result.customers,
        inference_result.cluster_distribution,
        inference_result.cluster_profiles,
        inference_result.silhouette_score,
        inference_result.elbow_method,
        inference_result.model_meta,
    )
    results_payload = build_results_payload(
        inference_result.customers,
        inference_result.segment_mix,
        inference_result.model_meta,
    )
    insights_payload = build_insights_payload(
        inference_result.customers,
        quality,
        inference_result.model_meta,
    )

    dataset_document = {
        "datasetId": dataset_id,
        "createdAt": datetime.now(timezone.utc),
        "uploadMeta": upload_meta,
        "quality": quality,
        "preview": preview_payload,
        "dashboard": dashboard_payload,
        "analysis": analysis_payload,
        "results": results_payload,
        "insights": insights_payload,
        "modelMeta": inference_result.model_meta,
    }

    repository = request.app.state.dataset_repository
    repository.save_dataset(dataset_document)

    return {
        "success": True,
        "message": "Dataset uploaded and queued for analysis.",
        "datasetId": dataset_id,
        "uploadMeta": upload_meta,
        "preview": {
            "rows": quality["totalRows"],
            "columns": quality["totalColumns"],
        },
        "modelMeta": inference_result.model_meta,
    }
