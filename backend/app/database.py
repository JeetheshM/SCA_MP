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

    def get_dataset(self, dataset_id: str | None = None) -> dict[str, Any] | None:
        if dataset_id:
            document = self.collection.find_one({"datasetId": dataset_id})
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
