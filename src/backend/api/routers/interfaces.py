#!/usr/bin/env python3
"""
Interfaces API router
Handles WiFi interface detection and management
"""

from fastapi import APIRouter, HTTPException
from typing import List
import logging

from ..models import InterfacesResponse, NetworkInterface, ErrorResponse
from ..services.wifi_service import wifi_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/interfaces", response_model=InterfacesResponse)
async def get_interfaces():
    """
    Get all available network interfaces
    
    Returns list of network interfaces with their status and capabilities.
    Focuses on wireless interfaces for WiFi scanning.
    """
    try:
        logger.info("Getting available interfaces")
        interfaces = await wifi_service.get_interfaces()
        
        return InterfacesResponse(
            interfaces=interfaces,
            total_count=len(interfaces)
        )
        
    except Exception as e:
        logger.error(f"Failed to get interfaces: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to detect interfaces: {str(e)}"
        )

@router.get("/interfaces/wireless", response_model=InterfacesResponse)
async def get_wireless_interfaces():
    """
    Get only wireless network interfaces
    
    Returns filtered list containing only wireless interfaces suitable for WiFi scanning.
    """
    try:
        logger.info("Getting wireless interfaces")
        all_interfaces = await wifi_service.get_interfaces()
        wireless_interfaces = [iface for iface in all_interfaces if iface.type.value == "wireless"]
        
        return InterfacesResponse(
            interfaces=wireless_interfaces,
            total_count=len(wireless_interfaces)
        )
        
    except Exception as e:
        logger.error(f"Failed to get wireless interfaces: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to detect wireless interfaces: {str(e)}"
        )