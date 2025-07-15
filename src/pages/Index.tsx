import { Whiteboard } from "@/components/whiteboard/Whiteboard";
import { Header } from "@/components/whiteboard/Header";
import { toast } from "sonner";

const Index = () => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Share link copied to clipboard!");
  };

  const handleSettings = () => {
    toast("Settings coming soon!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="ThinkBoard"
        onShare={handleShare}
        onSettings={handleSettings}
        collaborators={1}
      />
      <Whiteboard />
    </div>
  );
};

export default Index;
