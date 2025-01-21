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
    const [isVideoMuted, setIsVideoMuted] = useState(false); // Track video status
    const [participants, setParticipants] = useState([]); // Track participants
    const videoContainerRef = useRef(null);
    const participantVideosRef = useRef({}); // Store video elements for participants

    useEffect(() => {
        const initZoomClient = async () => {
            try {
                if (!("getDisplayMedia" in navigator.mediaDevices)) {
                    console.error(
                        "Browser does not support required media APIs."
                    );
                    alert(
                        "Your browser does not support the required media APIs. Please use the latest version of Chrome, Edge, or Firefox."
                    );
                    return;
                }

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

                // Create a container for the current user's video
                const videoContainer = videoContainerRef.current;
                if (videoContainer && userVideo) {
                    const userVideoContainer = document.createElement("div");
                    userVideoContainer.id = `participant-${
                        client.getCurrentUserInfo().userId
                    }`;
                    userVideoContainer.style.margin = "10px";
                    userVideoContainer.appendChild(userVideo);
                    videoContainer.appendChild(userVideoContainer);
                }

                // Set up event listeners for participants
                client.on("user-added", (user) => {
                    console.log("User added:", user);
                    handleUserAdded(user);
                });

                client.on("user-removed", (user) => {
                    console.log("User removed:", user);
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
                setParticipants([]); // Reset participants
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

    const toggleVideo = async () => {
        if (mediaStream) {
            if (isVideoMuted) {
                await mediaStream.startVideo({ fullHd: true });
            } else {
                await mediaStream.stopVideo();
            }
            setIsVideoMuted(!isVideoMuted);
        }
    };

    const handleUserAdded = async (user) => {
        if (mediaStream && user) {
            console.log("Adding user video for:", user.userId);
            const participantVideo = await mediaStream.attachVideo(
                user.userId,
                RESOLUTION
            );

            // Create a container for the remote participant's video
            const videoContainer = videoContainerRef.current;
            if (videoContainer && participantVideo) {
                const participantVideoContainer = document.createElement("div");
                participantVideoContainer.id = `participant-${user.userId}`;
                participantVideoContainer.style.margin = "10px";
                participantVideoContainer.appendChild(participantVideo);
                videoContainer.appendChild(participantVideoContainer);

                participantVideosRef.current[user.userId] =
                    participantVideoContainer;
                console.log({ userId: user.userId, userName: user.userName });

                // Update participant list
                setParticipants((prevParticipants) => [
                    ...prevParticipants,
                    { userId: user.userId, userName: user.userName },
                ]);
            }
        }
    };

    const handleUserRemoved = (user) => {
        console.log("Removing user video for:", user.userId);
        const videoContainer = videoContainerRef.current;
        const participantVideoContainer =
            participantVideosRef.current[user.userId];
        if (videoContainer && participantVideoContainer) {
            videoContainer.removeChild(participantVideoContainer);
            delete participantVideosRef.current[user.userId];

            // Update participant list
            setParticipants((prevParticipants) =>
                prevParticipants.filter(
                    (participant) => participant.userId !== user.userId
                )
            );
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
                    <button
                        className="py-4 px-6 bg-yellow-500 rounded-xl uppercase text-white ml-2"
                        onClick={toggleVideo}
                    >
                        {isVideoMuted ? "Start Video" : "Stop Video"}
                    </button>
                </>
            )}
            <div
                ref={videoContainerRef}
                style={{
                    marginTop: "20px",
                    display: "flex", // Flex layout for side-by-side arrangement
                    flexWrap: "wrap", // Wrap videos to the next row if needed
                    gap: "10px", // Add space between videos
                    backgroundColor: "#000", // Black background for video
                    width: "100%", // Ensure the container uses full width
                    justifyContent: "center", // Center videos horizontally
                }}
            ></div>
            {isInMeeting && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Participants</h3>
                    <ul>
                        {participants.map((participant) => (
                            <li key={participant.userId}>
                                {participant.userName ||
                                    `User-${participant.userId}`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default MeetingPage;
