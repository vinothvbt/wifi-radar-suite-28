#!/usr/bin/env python3
"""
WiFi Scanner API router
Handles WiFi scanning operations
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging
import uuid

from ..models import ScanRequest, ScanResponse, ScanStatusResponse, ScanStatus, ErrorResponse
from ..services.wifi_service import wifi_service

logger = logging.getLogger(__name__)
router = APIRouter()

# Store active scans (in production, use Redis or similar)
active_scans = {}

@router.post("/scan/start", response_model=ScanResponse)
async def start_scan(
    interface: str = Query(..., description="Network interface to scan with"),
    duration: Optional[int] = Query(5, description="Scan duration in seconds", ge=1, le=60),
    monitor_mode: bool = Query(False, description="Use monitor mode if available")
):
    """
    Start WiFi scan on specified interface
    
    Performs WiFi network discovery and returns detected access points.
    """
    try:
        # Generate scan ID
        scan_id = str(uuid.uuid4())
        logger.info(f"Starting scan {scan_id} on interface {interface}")
        
        # Mark scan as starting
        active_scans[scan_id] = {
            "status": ScanStatus.STARTING,
            "interface": interface,
            "duration": duration
        }
        
        # Perform the scan
        active_scans[scan_id]["status"] = ScanStatus.RUNNING
        scan_result = await wifi_service.scan_wifi(interface, duration)
        
        if scan_result.success:
            active_scans[scan_id]["status"] = ScanStatus.COMPLETED
            
            return ScanResponse(
                scan_id=scan_id,
                interface=interface,
                access_points=scan_result.access_points,
                total_count=len(scan_result.access_points),
                scan_duration=scan_result.duration,
                timestamp=scan_result.timestamp
            )
        else:
            active_scans[scan_id]["status"] = ScanStatus.FAILED
            raise HTTPException(
                status_code=400,
                detail=f"Scan failed: {scan_result.error_message}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scan failed with exception: {e}")
        if scan_id in active_scans:
            active_scans[scan_id]["status"] = ScanStatus.FAILED
        raise HTTPException(
            status_code=500,
            detail=f"Internal scan error: {str(e)}"
        )

@router.get("/scan/{scan_id}/status", response_model=ScanStatusResponse)
async def get_scan_status(scan_id: str):
    """
    Get status of a scan operation
    
    Returns current status and progress of the specified scan.
    """
    if scan_id not in active_scans:
        raise HTTPException(
            status_code=404,
            detail=f"Scan {scan_id} not found"
        )
    
    scan_info = active_scans[scan_id]
    
    return ScanStatusResponse(
        scan_id=scan_id,
        status=scan_info["status"],
        message=f"Scan on interface {scan_info['interface']}"
    )

@router.delete("/scan/{scan_id}")
async def cancel_scan(scan_id: str):
    """
    Cancel an active scan operation
    
    Stops the specified scan if it's currently running.
    """
    if scan_id not in active_scans:
        raise HTTPException(
            status_code=404,
            detail=f"Scan {scan_id} not found"
        )
    
    scan_info = active_scans[scan_id]
    
    if scan_info["status"] in [ScanStatus.COMPLETED, ScanStatus.FAILED, ScanStatus.CANCELLED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel scan in status: {scan_info['status']}"
        )
    
    # Mark as cancelled (actual cancellation would require process management)
    active_scans[scan_id]["status"] = ScanStatus.CANCELLED
    logger.info(f"Cancelled scan {scan_id}")
    
    return {"message": f"Scan {scan_id} cancelled"}

@router.get("/scan/active")
async def get_active_scans():
    """
    Get list of all active scans
    
    Returns information about currently running or recent scans.
    """
    return {
        "active_scans": [
            {
                "scan_id": scan_id,
                "status": scan_info["status"],
                "interface": scan_info["interface"]
            }
            for scan_id, scan_info in active_scans.items()
            if scan_info["status"] in [ScanStatus.STARTING, ScanStatus.RUNNING]
        ],
        "total_active": len([s for s in active_scans.values() if s["status"] in [ScanStatus.STARTING, ScanStatus.RUNNING]])
    }