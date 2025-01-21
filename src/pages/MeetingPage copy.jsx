import { useEffect, useState, useRef } from "react";
import ZoomVideo from "@zoom/videosdk";
import { generateSignature } from "../utils/utils";

const sdkKey = import.meta.env.VITE_SDK_KEY;
const sdkSecret = import.meta.env.VITE_SDK_SECRET;
const topic = "SomeTopicName";
const role = 1;
const username = `User-${new Date().getTime().toString().slice(6)}`;

function MeetingPage() {
    const [client, setClient] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const initZoomClient = async () => {
            try {
                const zoomClient = ZoomVideo.createClient();
                await zoomClient.init("en-US", "Global", {
                    patchJsMedia: true,
                });
                setClient(zoomClient);
                setMediaStream(zoomClient.getMediaStream());
            } catch (error) {
                console.error("Error initializing Zoom client:", error);
            }
        };

        initZoomClient();
    }, []);

    const handleJoin = async () => {
        if (client && mediaStream) {
            const token = generateSignature(topic, role, sdkKey, sdkSecret);
            console.log("---token", token);
            try {
                await client.join(topic, token, username);

                // Start audio and video streams
                await mediaStream.startAudio();
                await mediaStream.startVideo();

                // Render self-video using Zoom SDK
                const canvas = canvasRef.current;
                if (canvas) {
                    mediaStream.renderVideo(
                        canvas,
                        client.getCurrentUserInfo().userId,
                        640, // Width
                        360, // Height
                        0, // Position X
                        0 // Position Y
                    );
                }

                console.log("Joined the meeting and started video");
            } catch (error) {
                console.error("Error joining the meeting:", error);
            }
        } else {
            console.error("Zoom client or media stream is not initialized");
        }
    };

    if (!client || !mediaStream) {
        return <p>Loading Zoom client...</p>;
    }

    const handleLeaveCall = () => {
        client.leave();
    };

    return (
        <div>
            <button
                className="py-4 px-6 bg-blue-500 rounded-xl uppercase text-white"
                onClick={handleJoin}
            >
                Join Call
            </button>
            <button
                className="py-4 px-6 bg-blue-500 rounded-xl uppercase text-white"
                onClick={handleLeaveCall}
            >
                Leave Call
            </button>
            <div style={{ marginTop: "20px" }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        width: "640px",
                        height: "360px",
                        backgroundColor: "#000",
                    }}
                ></canvas>
            </div>
        </div>
    );
}

export default MeetingPage;
