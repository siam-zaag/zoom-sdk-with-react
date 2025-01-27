import { useEffect, useState, useRef } from "react";
import ZoomVideo from "@zoom/videosdk";
import { generateSignature } from "../../utils/utils";

function ZoomMeeting() {
    const [client, setClient] = useState(null);
    const [isMeetingJoined, setIsMeetingJoined] = useState(false);
    const [cameras, setCameras] = useState([]);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef([]);

    useEffect(() => {
        // Initialize Zoom Video SDK client
        const zoomClient = ZoomVideo.createClient();
        setClient(zoomClient);

        // Cleanup on unmount
        return () => {
            if (zoomClient) {
                zoomClient.leave();
            }
        };
    }, []);

    const initZoomSDK = async () => {
        try {
            await client.init("en-US", "Global");
            console.log("Zoom SDK initialized successfully");
        } catch (error) {
            console.error("Error initializing Zoom SDK:", error);
        }
    };
    // Initialize SDK and join meeting
    // v1
    // const joinMeeting = async () => {
    //     if (!client) return;

    //     try {
    //         // Initialize SDK
    //         await initZoomSDK();

    //         console.log("---client", client);

    //         // await client.init("en-US", "Global");

    //         // Join meeting
    //         const sessionName = "your_session_name"; // Replace with your session name
    //         const userName = "Your_Name"; // Replace with your name
    //         const token = generateSignature(
    //             sessionName,
    //             1,
    //             import.meta.env.VITE_SDK_KEY,
    //             import.meta.env.VITE_SDK_SECRET
    //         ); // Generate token (replace with your logic)
    //         // await client.join(sessionName, token, userName);
    //         await client.join(sessionName, token, userName);

    //         // Start video and audio
    //         await client.startVideo();
    //         await client.startAudio();

    //         // Set meeting joined state
    //         setIsMeetingJoined(true);

    //         // Get available cameras
    //         const cameraList = await client.getCameras();
    //         setCameras(cameraList);

    //         // Render local video stream
    //         const localVideoStream = client
    //             .getMediaStream()
    //             .getLocalVideoTrack();
    //         if (localVideoRef.current) {
    //             localVideoRef.current.srcObject = localVideoStream;
    //         }

    //         // Listen for remote video streams
    //         client.on("user-added", (user) => {
    //             const remoteVideoStream = client
    //                 .getMediaStream()
    //                 .getRemoteVideoTrack(user.userId);
    //             if (remoteVideoRef.current[user.userId]) {
    //                 remoteVideoRef.current[user.userId].srcObject =
    //                     remoteVideoStream;
    //             }
    //         });

    //         client.on("user-removed", (user) => {
    //             if (remoteVideoRef.current[user.userId]) {
    //                 remoteVideoRef.current[user.userId].srcObject = null;
    //             }
    //         });
    //     } catch (error) {
    //         console.error("Error joining meeting:", error);
    //     }
    // };

    // v2
    // const joinMeeting = async () => {
    //     console.log("clcik");

    //     if (!client) return;

    //     try {
    //         // Initialize SDK
    //         await initZoomSDK();

    //         // Join meeting
    //         const sessionName = "your_session_name"; // Replace with your session name
    //         const userName = "Your_Name"; // Replace with your name
    //         const token = generateSignature(
    //             sessionName,
    //             1,
    //             import.meta.env.VITE_SDK_KEY,
    //             import.meta.env.VITE_SDK_SECRET
    //         );

    //         await client.join(sessionName, token, userName);

    //         // Get the media stream instance
    //         const mediaStream = client.getMediaStream();

    //         // Start local video
    //         await mediaStream.startVideo();

    //         // Start local audio
    //         await mediaStream.startAudio();

    //         // Set meeting joined state
    //         setIsMeetingJoined(true);

    //         // Get available cameras
    //         const cameraList = await mediaStream.getCameraList();
    //         setCameras(cameraList);

    //         // Render local video stream
    //         if (localVideoRef.current) {
    //             mediaStream.renderVideo(
    //                 localVideoRef.current,
    //                 client.getCurrentUserInfo().userId,
    //                 720, // video width
    //                 480, // video height
    //                 0, // x-coordinate
    //                 0 // y-coordinate
    //             );
    //         }

    //         // Listen for remote video streams
    //         client.on("user-added", (user) => {
    //             if (remoteVideoRef.current[user.userId]) {
    //                 mediaStream.renderVideo(
    //                     remoteVideoRef.current[user.userId],
    //                     user.userId,
    //                     720,
    //                     480,
    //                     0,
    //                     0
    //                 );
    //             }
    //         });

    //         client.on("user-removed", (user) => {
    //             if (remoteVideoRef.current[user.userId]) {
    //                 mediaStream.stopRenderVideo(
    //                     remoteVideoRef.current[user.userId]
    //                 );
    //             }
    //         });
    //     } catch (error) {
    //         console.error("Error joining meeting:", error);
    //     }
    // };
    // v3
    const joinMeeting = async () => {
        if (!client) return;

        try {
            // Initialize SDK
            await initZoomSDK();

            // Join meeting
            const sessionName = "your_session_name"; // Replace with your session name
            const userName = "Your_Name"; // Replace with your name
            const token = generateSignature(
                sessionName,
                1,
                import.meta.env.VITE_SDK_KEY,
                import.meta.env.VITE_SDK_SECRET
            );

            await client.join(sessionName, token, userName);

            // Get the media stream instance
            const mediaStream = client.getMediaStream();

            // Start local video
            await mediaStream.startVideo();
            console.log("Video started");

            // Render local video
            // if (localVideoRef.current) {
            //     mediaStream.renderVideo(
            //         localVideoRef.current,
            //         client.getCurrentUserInfo().userId,
            //         720, // video width
            //         480, // video height
            //         0, // x-coordinate
            //         0 // y-coordinate
            //     );
            //     console.log("Local video rendered");
            // } else {
            //     console.error("Local video element not found");
            // }
            // Render local video stream
            if (localVideoRef.current) {
                mediaStream.renderVideo(
                    localVideoRef.current,
                    client.getCurrentUserInfo().userId,
                    720, // video width
                    480, // video height
                    0, // x-coordinate
                    0 // y-coordinate
                );
                console.log("Local video rendered");
            } else {
                console.error("Local video element not found. Retrying...");
                setTimeout(() => {
                    if (localVideoRef.current) {
                        mediaStream.renderVideo(
                            localVideoRef.current,
                            client.getCurrentUserInfo().userId,
                            720,
                            480,
                            0,
                            0
                        );
                        console.log("Local video rendered after retry");
                    } else {
                        console.error(
                            "Local video element still not found after retry"
                        );
                    }
                }, 500); // Retry after 500ms
            }

            // Start local audio
            await mediaStream.startAudio();
            console.log("Audio started");

            // Set meeting joined state
            setIsMeetingJoined(true);

            // Get available cameras
            const cameraList = await mediaStream.getCameraList();
            setCameras(cameraList);

            // Listen for remote video streams
            client.on("user-added", (user) => {
                if (remoteVideoRef.current[user.userId]) {
                    mediaStream.renderVideo(
                        remoteVideoRef.current[user.userId],
                        user.userId,
                        720,
                        480,
                        0,
                        0
                    );
                    console.log(
                        `Remote video rendered for user: ${user.userId}`
                    );
                }
            });

            client.on("user-removed", (user) => {
                console.log("---user", user);

                if (remoteVideoRef.current[user.userId]) {
                    mediaStream.stopRenderVideo(
                        remoteVideoRef.current[user.userId]
                    );
                    console.log(
                        `Remote video stopped for user: ${user.userId}`
                    );
                }
            });
        } catch (error) {
            console.error("Error joining meeting:", error);
        }
    };

    // Generate a token (replace with your backend logic)

    // Start screen sharing
    const startScreenShare = async () => {
        if (!client) return;
        try {
            await client.startShareScreen();
        } catch (error) {
            console.error("Error starting screen share:", error);
        }
    };

    // Stop screen sharing
    const stopScreenShare = async () => {
        if (!client) return;
        try {
            await client.stopShareScreen();
        } catch (error) {
            console.error("Error stopping screen share:", error);
        }
    };

    // Start recording
    const startRecording = async () => {
        if (!client) return;
        try {
            await client.startCloudRecording();
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    // Stop recording
    const stopRecording = async () => {
        if (!client) return;
        try {
            await client.stopCloudRecording();
        } catch (error) {
            console.error("Error stopping recording:", error);
        }
    };

    // Switch camera
    const switchCamera = async (deviceId) => {
        if (!client) return;
        try {
            await client.switchCamera(deviceId);
        } catch (error) {
            console.error("Error switching camera:", error);
        }
    };

    // Leave meeting
    const leaveMeeting = async () => {
        if (!client) return;
        try {
            await client.leave();
            setIsMeetingJoined(false);
        } catch (error) {
            console.error("Error leaving meeting:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">
                Zoom Video SDK Demo
            </h1>

            {!isMeetingJoined ? (
                <div className="flex justify-center">
                    <button
                        onClick={joinMeeting}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Join Meeting
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            className="w-full h-48 md:h-64 bg-black rounded-lg shadow-md"
                        />
                        {/* {Array.from({ length: 5 }).map((_, index) => (
                            <video
                                key={index}
                                ref={(el) =>
                                    (remoteVideoRef.current[index] = el)
                                }
                                autoPlay
                                className="w-full h-48 md:h-64 bg-black rounded-lg shadow-md"
                            />
                        ))} */}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={startScreenShare}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            Start Screen Share
                        </button>
                        <button
                            onClick={stopScreenShare}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                            Stop Screen Share
                        </button>
                        <button
                            onClick={startRecording}
                            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                        >
                            Start Recording
                        </button>
                        <button
                            onClick={stopRecording}
                            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                        >
                            Stop Recording
                        </button>
                        <select
                            onChange={(e) => switchCamera(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                        >
                            {cameras.map((camera, index) => (
                                <option key={index} value={camera.deviceId}>
                                    {camera.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={leaveMeeting}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            Leave Meeting
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ZoomMeeting;
