import { useEffect, useState, useRef } from "react";
import ZoomVideo from "@zoom/videosdk";
import { generateSignature } from "../utils/utils";

const sdkKey = import.meta.env.VITE_SDK_KEY;
const sdkSecret = import.meta.env.VITE_SDK_SECRET;
const topic = "SomeTopicName";
const role = 1;
const username = `User-${new Date().getTime().toString().slice(6)}`;
const RESOLUTION = "360p"; // Define resolution

function MeetingPage() {
    const [client, setClient] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [isInMeeting, setIsInMeeting] = useState(false); // Track meeting status
    const [isJoining, setIsJoining] = useState(false); // Track joining status
    const videoContainerRef = useRef(null);

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
            setIsJoining(true); // Set joining status to true
            const token = generateSignature(topic, role, sdkKey, sdkSecret);
            console.log("---token", token);
            try {
                await client.join(topic, token, username);

                // Start the video
                await mediaStream.startVideo({ fullHd: true });

                // Attach self-view video
                const userVideo = await mediaStream.attachVideo(
                    client.getCurrentUserInfo().userId,
                    RESOLUTION
                );

                // Append video element to container
                const videoContainer = videoContainerRef.current;
                if (videoContainer && userVideo) {
                    videoContainer.appendChild(userVideo);
                }

                // Update meeting status
                setIsJoining(false); // Reset joining status
                setIsInMeeting(true);
                console.log("Joined the meeting and started video");
            } catch (error) {
                console.error("Error joining the meeting:", error);
                setIsJoining(false); // Reset joining status on error
            }
        } else {
            console.error("Zoom client or media stream is not initialized");
        }
    };

    const handleLeaveCall = async () => {
        if (client) {
            try {
                await client.leave();
                // Clear video container
                const videoContainer = videoContainerRef.current;
                if (videoContainer) {
                    videoContainer.innerHTML = ""; // Clear any appended video elements
                }
                setIsInMeeting(false);
                console.log("Left the meeting");
            } catch (error) {
                console.error("Error leaving the meeting:", error);
            }
        }
    };

    if (!client || !mediaStream) {
        return <p>Loading Zoom client...</p>;
    }

    return (
        <div>
            {!isInMeeting && !isJoining && (
                <button
                    className="py-4 px-6 bg-blue-500 rounded-xl uppercase text-white"
                    onClick={handleJoin}
                >
                    Join Call
                </button>
            )}
            {isJoining && <p>Joining...</p>}
            {isInMeeting && (
                <button
                    className="py-4 px-6 bg-red-500 rounded-xl uppercase text-white"
                    onClick={handleLeaveCall}
                >
                    Leave Call
                </button>
            )}
            <div ref={videoContainerRef}></div>
        </div>
    );
}

export default MeetingPage;
