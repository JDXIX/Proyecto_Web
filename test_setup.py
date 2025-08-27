#!/usr/bin/env python3
"""
Test script to verify that the Django project can run without computer vision dependencies.
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent / 'sistema_educativo'
sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_educativo.settings')
django.setup()

def test_basic_imports():
    """Test that basic Django imports work."""
    try:
        from django.core.management import call_command
        from usuarios.models import Usuario
        from cursos.models import Curso
        from atencion.models import SesionMonitoreo
        from recomendaciones.models import RecomendacionIA
        print("✅ Basic Django imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_urls():
    """Test that URL patterns can be loaded."""
    try:
        from django.urls import reverse
        from django.test import Client
        client = Client()
        # This will test that URLconf can be loaded without errors
        response = client.get('/api/')
        print(f"✅ URLs loaded successfully (status: {response.status_code})")
        return True
    except Exception as e:
        print(f"❌ URL loading error: {e}")
        return False

def test_computer_vision_graceful_failure():
    """Test that computer vision functions fail gracefully."""
    try:
        from atencion.views import COMPUTER_VISION_AVAILABLE, monitorear_atencion_durante_tiempo
        
        if COMPUTER_VISION_AVAILABLE:
            print("✅ Computer vision dependencies available")
        else:
            print("⚠️  Computer vision dependencies not available (this is expected)")
            # Test that the fallback function works
            result = monitorear_atencion_durante_tiempo()
            if "error" in result:
                print("✅ Graceful error handling for missing computer vision deps")
            
        return True
    except Exception as e:
        print(f"❌ Computer vision graceful failure test error: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Testing Django setup without computer vision dependencies...")
    print("=" * 60)
    
    tests = [
        test_basic_imports,
        test_urls,
        test_computer_vision_graceful_failure
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
        print()
    
    print(f"📊 Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! The project setup is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Check the setup.")
        return 1

if __name__ == '__main__':
    sys.exit(main())