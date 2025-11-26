import { useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

import { useGestureStore } from '../store';

const HandTracker = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { setRotation, setScale, setPosition } = useGestureStore();

    useEffect(() => {
        const initHandLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
            );
            const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numHands: 1,
            });

            if (videoRef.current) {
                navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.addEventListener('loadeddata', () => {
                            predictWebcam(handLandmarker);
                        });
                    }
                });
            }
        };

        initHandLandmarker();
    }, []);

    const predictWebcam = (handLandmarker: HandLandmarker) => {
        if (videoRef.current && videoRef.current.currentTime !== videoRef.current.duration) {
            const startTimeMs = performance.now();
            const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];

                // 1. Position (Wrist)
                // Map 0..1 to -5..5 (approx scene range)
                const x = (0.5 - landmarks[0].x) * 10;
                const y = (0.5 - landmarks[0].y) * 8;
                setPosition(x, y, 0);

                // 2. Scale (Pinch: Thumb tip vs Index tip)
                const thumbTip = landmarks[4];
                const indexTip = landmarks[8];
                const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
                // Map distance 0.02..0.2 to scale 0.5..2
                const scale = Math.max(0.5, Math.min(3, distance * 10));
                setScale(scale);

                // 3. Rotation (Wrist to Middle Finger MCP)
                // This is a bit simplified.
                const wrist = landmarks[0];
                const middleMcp = landmarks[9];
                const dx = middleMcp.x - wrist.x;
                const dy = middleMcp.y - wrist.y;
                const rotationZ = Math.atan2(dy, dx);
                // We can map this to rotation
                setRotation(0, -rotationZ); // Invert for mirror effect
            }

            requestAnimationFrame(() => predictWebcam(handLandmarker));
        }
    };

    return (
        <div className="absolute top-0 left-0 z-10 p-4">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-32 h-24 border border-white opacity-50 rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
            />
        </div>
    );
};

export default HandTracker;
