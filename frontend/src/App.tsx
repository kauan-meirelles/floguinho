import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import RequireAuth from "@/components/RequireAuth";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Feed from "@/pages/Feed";
import Explore from "@/pages/Explore";
import Create from "@/pages/Create";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Chat from "@/pages/Chat";
import ChatThread from "@/pages/ChatThread";

// Uma <Route> por página em src/pages; BrowserRouter já envolve isso no main.tsx.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Feed />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:username" element={<ChatThread />} />
          <Route path="/create" element={<Create />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/u/:username" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}