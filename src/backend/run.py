#!/usr/bin/env python3
"""
WiFi Radar Suite Backend Entry Point
Starts the FastAPI server for the web-based WiFi scanning application
"""

import sys
import os
import logging

# Add the backend directory to the path so we can import modules
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

def main():
    """Main entry point for the backend server"""
    try:
        import uvicorn
        from api.main import app
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        logger = logging.getLogger(__name__)
        logger.info("Starting WiFi Radar Suite Backend...")
        
        # Run the FastAPI server
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except ImportError as e:
        print(f"Error: Missing required dependencies: {e}")
        print("Please install the required packages:")
        print("pip install fastapi uvicorn pydantic")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()