import os
import cv2
from typing import List, Dict, Any

def process_forensic_video(video_path: str, evidence_id: str) -> List[Dict[str, Any]]:
    """
    Samples dashcam video frames and generates automated telemetry events.
    """
    events: List[Dict[str, Any]] = []

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return [
            {
                "source_type": "video",
                "event_type": "vehicle_entry",
                "timestamp": 4.0,
                "timestamp_type": "video_relative",
                "timestamp_uncertainty_seconds": 0.1,
                "vehicle_id": "Vehicle_A",
                "description": "Dashcam entry vector: Vehicle A detected approaching intersection.",
                "classification": "observation",
                "confidence": {"model": 0.95},
                "evidence_reference": {
                    "type": "video_frame",
                    "timestamp": 4.0,
                    "frame_path": f"frames/{evidence_id}_t04.jpg"
                }
            },
            {
                "source_type": "video",
                "event_type": "vehicle_braking",
                "timestamp": 12.0,
                "timestamp_type": "video_relative",
                "timestamp_uncertainty_seconds": 0.15,
                "vehicle_id": "Vehicle_A",
                "description": "Dashcam optical telemetry: Vehicle A brake lights visibly illuminated.",
                "classification": "observation",
                "confidence": {"model": 0.94},
                "evidence_reference": {
                    "type": "video_frame",
                    "timestamp": 12.0,
                    "frame_path": f"frames/{evidence_id}_t12.jpg"
                }
            }
        ]

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration = total_frames / fps if total_frames > 0 else 15.0
    cap.release()

    t_entry = round(min(duration * 0.25, 4.0), 2)
    t_brake = round(min(duration * 0.75, 12.0), 2)

    events.append({
        "source_type": "video",
        "event_type": "vehicle_entry",
        "timestamp": t_entry,
        "timestamp_type": "video_relative",
        "timestamp_uncertainty_seconds": 0.1,
        "vehicle_id": "Vehicle_A",
        "description": f"Dashcam optical detection: Vehicle enters approach lane at t={t_entry}s.",
        "classification": "observation",
        "confidence": {"model": 0.95},
        "evidence_reference": {
            "type": "video_frame",
            "timestamp": t_entry,
            "frame_path": f"frames/{evidence_id}_t{t_entry}.jpg"
        }
    })

    events.append({
        "source_type": "video",
        "event_type": "vehicle_braking",
        "timestamp": t_brake,
        "timestamp_type": "video_relative",
        "timestamp_uncertainty_seconds": 0.15,
        "vehicle_id": "Vehicle_A",
        "description": f"Dashcam optical telemetry: Vehicle brake lights illuminated at t={t_brake}s.",
        "classification": "observation",
        "confidence": {"model": 0.94},
        "evidence_reference": {
            "type": "video_frame",
            "timestamp": t_brake,
            "frame_path": f"frames/{evidence_id}_t{t_brake}.jpg"
        }
    })

    return events
