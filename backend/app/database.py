from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from pymongo import DESCENDING, MongoClient
from pymongo.collection import Collection

from .config import Settings


@dataclass
class DatasetRepository:
    collection: Collection

    def save_dataset(self, payload: dict[str, Any]) -> None:
        self.collection.update_one(
            {"datasetId": payload["datasetId"]},
            {"$set": payload},
            upsert=True,
        )

    def get_dataset(
        self,
        dataset_id: str | None = None,
        dataset_type: str | None = None,
    ) -> dict[str, Any] | None:
        query: dict[str, Any] = {}

        if dataset_id:
            query["datasetId"] = dataset_id

        if dataset_type == "customer":
            # Backward compatibility: older customer uploads may not have datasetType.
            query["$or"] = [
                {"datasetType": "customer"},
                {"datasetType": {"$exists": False}},
                {"datasetType": None},
            ]
        elif dataset_type:
            query["datasetType"] = dataset_type

        if query:
            document = self.collection.find_one(query, sort=[("createdAt", DESCENDING)])
        else:
            document = self.collection.find_one(sort=[("createdAt", DESCENDING)])

        if not document:
            return None

        document.pop("_id", None)
        return document


def initialize_repository(settings: Settings) -> tuple[MongoClient, DatasetRepository]:
    client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")

    collection = client[settings.mongodb_db_name][settings.mongodb_collection]
    collection.create_index("datasetId", unique=True)
    collection.create_index("createdAt")

    return client, DatasetRepository(collection=collection)
