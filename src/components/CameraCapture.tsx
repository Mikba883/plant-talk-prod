
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ScanAnimation from '@/components/ScanAnimation';
import { generateSessionId, markNewImageSession } from '@/utils/dataReset';

interface CameraCaptureProps {
  onImageCapture?: (image: string) => void;
  isLoading?: boolean;
  showPreview: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCapture, isLoading = false, showPreview }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Detect if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Simple camera constraints
  const getCameraConstraints = () => ({
    video: {
      facingMode: isMobile ? 'environment' : 'user',
      width: { ideal: 640 },
      height: { ideal: 480 }
    }
  });

  // Start camera function
  const startCamera = useCallback(async () => {
    console.log('🔄 Starting camera...');
    setCameraLoading(true);
    setError(null);

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia(getCameraConstraints());
      console.log('✅ Camera stream obtained');

      // Store stream reference
      streamRef.current = stream;

      // Set up video element
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        // Wait for video to load and play
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }

        // Simple check for video readiness
        const checkReady = () => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            console.log('✅ Camera ready:', video.videoWidth, 'x', video.videoHeight);
            setCameraActive(true);
            setCameraLoading(false);
          } else {
            setTimeout(checkReady, 100);
          }
        };

        checkReady();
      }

    } catch (err: any) {
      console.error('❌ Camera error:', err);
      setCameraLoading(false);
      setCameraActive(false);
      
      let errorMessage = 'Failed to access camera';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.';
      }
      
      setError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast, isMobile]);

  // Stop camera function
  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraLoading(false);
    setError(null);
  }, []);

  // Capture photo function
  const capturePhoto = useCallback(() => {
    console.log('📸 Capturing photo...');
    
    if (!videoRef.current || !canvasRef.current || !cameraActive) {
      toast({
        title: "Capture Error",
        description: "Camera not ready",
        variant: "destructive",
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      console.log('✅ Photo captured successfully');
      
      // Set captured image and stop camera
      setCapturedImage(dataUrl);
      stopCamera();
      
      // Store in session storage
      sessionStorage.setItem('capturedImage', dataUrl);
      
      // Call callback if provided
      if (onImageCapture) {
        onImageCapture(dataUrl);
      }
    }
  }, [cameraActive, stopCamera, onImageCapture, toast]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        console.log('📁 File uploaded successfully');
        
        setCapturedImage(imageData);
        stopCamera();
        
        // Store in session storage
        sessionStorage.setItem('capturedImage', imageData);
        
        // Call callback if provided
        if (onImageCapture) {
          onImageCapture(imageData);
        }
      };
      reader.readAsDataURL(file);
    }
    
    // Clear input
    if (event.target) {
      event.target.value = '';
    }
  }, [stopCamera, onImageCapture]);

  // Retake photo function
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    sessionStorage.removeItem('capturedImage');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Don't render if showPreview is false
  if (!showPreview) {
    return null;
  }

  return (
    <Card className="w-full max-w-lg mx-auto plant-card-shadow bg-gradient-to-br from-white to-plant-light-green/5">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center">
          {!capturedImage ? (
            <>
              {/* Camera preview area */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 w-full aspect-[4/5] mb-4 shadow-xl">
                {/* Video element */}
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  autoPlay 
                  muted 
                  playsInline
                />
                
                {/* Hidden canvas for capturing */}
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Loading state */}
                {cameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-plant-dark-green border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Starting camera...</p>
                    </div>
                  </div>
                )}
                
                {/* Error state */}
                {error && !cameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center p-4">
                      <Camera className="h-12 w-12 text-red-400 mx-auto mb-2" />
                      <p className="text-sm text-red-600 mb-2">{error}</p>
                      <Button 
                        onClick={startCamera}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Default state */}
                {!cameraActive && !cameraLoading && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center p-4">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Ready to capture your plant</p>
                    </div>
                  </div>
                )}
                
                {/* Capture button */}
                {cameraActive && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={capturePhoto}
                      disabled={isLoading}
                      className="w-14 h-14 rounded-full bg-white hover:bg-plant-dark-green border-4 border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center group disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 group-hover:bg-white flex items-center justify-center transition-colors duration-200">
                        <Camera className="h-5 w-5 text-plant-dark-green" />
                      </div>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              {!isLoading && (
                <div className="flex flex-col gap-2 w-full">
                  {!cameraActive ? (
                    <Button 
                      onClick={startCamera} 
                      className="w-full bg-plant-dark-green hover:bg-plant-dark-green/90 text-white rounded-xl h-11 font-medium shadow-lg"
                      disabled={cameraLoading}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {cameraLoading ? 'Starting Camera...' : 'Take Photo'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopCamera} 
                      variant="outline"
                      className="w-full border-2 border-plant-light-green text-plant-dark-green hover:bg-plant-light-green/10 rounded-xl h-11 font-medium"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Close Camera
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full border-2 border-plant-light-green text-plant-dark-green hover:bg-plant-light-green/10 rounded-xl h-11 font-medium"
                    disabled={cameraLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload from Gallery
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </>
          ) : (
            /* Captured image display */
            <div className="flex flex-col items-center w-full">
              <div className="relative rounded-2xl overflow-hidden w-full aspect-[4/5] mb-4 shadow-xl">
                <img 
                  src={capturedImage} 
                  alt="Captured Plant" 
                  className="w-full h-full object-cover"
                />
                
                <ScanAnimation 
                  isScanning={isLoading} 
                  direction="vertical" 
                  showParticles={true} 
                />
              </div>
              
              {!isLoading && (
                <div className="flex flex-col gap-2 w-full">
                  <Button 
                    onClick={retakePhoto} 
                    variant="outline"
                    className="w-full border-2 border-plant-light-green text-plant-dark-green hover:bg-plant-light-green/10 rounded-xl h-11 font-medium"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake Photo
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraCapture;
