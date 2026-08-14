"""Mux Video API.

Thin httpx wrapper rather than the mux-python SDK: we use four endpoints, and the
SDK drags in a lot for that. Credentials come from E-motion's own Mux environment
and must never be shared with another product's environment.
"""
import base64
from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException, status

from config import settings

API_BASE = "https://api.mux.com"
TIMEOUT = httpx.Timeout(30.0)


def _auth_header() -> Dict[str, str]:
    if not settings.mux_configured:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Mux is not configured. Set MUX_TOKEN_ID and MUX_TOKEN_SECRET.",
        )
    pair = f"{settings.MUX_TOKEN_ID}:{settings.MUX_TOKEN_SECRET}".encode()
    return {"Authorization": f"Basic {base64.b64encode(pair).decode()}"}


def _request(method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    with httpx.Client(timeout=TIMEOUT) as client:
        res = client.request(method, f"{API_BASE}{path}", headers=_auth_header(), json=payload)

    if res.status_code == 404:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found in Mux")
    if res.status_code >= 400:
        # Surface Mux's own message; guessing at causes here wastes debugging time.
        detail = res.text[:400]
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Mux error {res.status_code}: {detail}")
    if res.status_code == 204 or not res.content:
        return {}
    return res.json().get("data", {})


def create_direct_upload(cors_origin: str) -> Dict[str, Any]:
    """A one-shot signed URL the browser PUTs the file straight to.

    The video never passes through our backend, so uploads are not bounded by
    Railway's request limits or timeouts.

    video_quality is "plus" deliberately: the account default ("basic") ships a
    single rendition and stutters on weaker connections.
    """
    return _request(
        "POST",
        "/video/v1/uploads",
        {
            "cors_origin": cors_origin,
            "new_asset_settings": {
                "playback_policy": ["public"],
                "video_quality": "plus",
            },
        },
    )


def get_upload(upload_id: str) -> Dict[str, Any]:
    return _request("GET", f"/video/v1/uploads/{upload_id}")


def get_asset(asset_id: str) -> Dict[str, Any]:
    return _request("GET", f"/video/v1/assets/{asset_id}")


def delete_asset(asset_id: str) -> None:
    _request("DELETE", f"/video/v1/assets/{asset_id}")


def public_playback_id(asset: Dict[str, Any]) -> Optional[str]:
    for entry in asset.get("playback_ids") or []:
        if entry.get("policy") == "public":
            return entry.get("id")
    return None
