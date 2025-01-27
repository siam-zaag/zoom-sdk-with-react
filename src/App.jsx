import MeetingPage from "./pages/MeetingPage";
import ZoomMeeting from "./pages/v2/ZoomMeeting";

export default function App() {
    return (
        <div className="flex justify-center items-center h-screen">
            <MeetingPage />
            {/* <ZoomMeeting /> */}
        </div>
    );
}
