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
    const [isAudioMuted, setIsAudioMuted] = useState(false); // Track audio status
    const videoContainerRef = useRef(null);
    const participantVideosRef = useRef({}); // Store video elements for participants

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

                // Start audio and video
                await mediaStream.startAudio();
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

                // Handle remote participant video
                client.on("user-added", (user) => {
                    handleUserAdded(user);
                });

                client.on("user-removed", (user) => {
                    handleUserRemoved(user);
                });

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

    const toggleAudio = async () => {
        if (mediaStream) {
            if (isAudioMuted) {
                await mediaStream.unmuteAudio();
            } else {
                await mediaStream.muteAudio();
            }
            setIsAudioMuted(!isAudioMuted);
        }
    };

    const handleUserAdded = async (user) => {
        if (mediaStream && user) {
            const participantVideo = await mediaStream.attachVideo(
                user.userId,
                RESOLUTION
            );
            const videoContainer = videoContainerRef.current;

            if (videoContainer && participantVideo) {
                participantVideosRef.current[user.userId] = participantVideo;
                videoContainer.appendChild(participantVideo);
            }
        }
    };

    const handleUserRemoved = (user) => {
        const videoContainer = videoContainerRef.current;
        if (videoContainer && participantVideosRef.current[user.userId]) {
            const videoElement = participantVideosRef.current[user.userId];
            videoContainer.removeChild(videoElement);
            delete participantVideosRef.current[user.userId];
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
                <>
                    <button
                        className="py-4 px-6 bg-red-500 rounded-xl uppercase text-white"
                        onClick={handleLeaveCall}
                    >
                        Leave Call
                    </button>
                    <button
                        className="py-4 px-6 bg-green-500 rounded-xl uppercase text-white ml-2"
                        onClick={toggleAudio}
                    >
                        {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
                    </button>
                </>
            )}
            <div
                ref={videoContainerRef}
                style={{
                    marginTop: "20px",
                    width: "640px",
                    height: "360px",
                    backgroundColor: "#000", // Black background for video
                    display: isInMeeting ? "block" : "none", // Hide before joining
                }}
            ></div>
        </div>
    );
}

export default MeetingPage;
