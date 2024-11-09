"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button"; 
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Progress } from "@/components/ui/progress";
import { FaDownload, FaHeart, FaPlay, FaPause } from "react-icons/fa";

interface Recitation {
  id: number;
  title: string;
  attachments: Attachment[];
}

interface Attachment {
  id: number;
  title: string;
  size: string;
  url: string;
}

const ReciterPage = () => {
  const searchParams = useSearchParams();
  const recitations = useMemo(() => {
    return searchParams.get("recitations")
      ? searchParams.get("recitations")!.split(",").map(Number)
      : [];
  }, [searchParams]);

  const [recitationData, setRecitationData] = useState<Recitation[]>([]);
  // const [error, setError] = useState<string | null>(null);
  const [playingAttachment, setPlayingAttachment] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchRecitationData = async (id: number): Promise<Recitation | null> => {
      try {
        const response = await fetch(`https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/quran/get-recitation/${id}/ar/json`);
        
        if (!response.ok) {
          setError(`Failed to fetch data for ID ${id}`);
          return null;
        }

        const data: Recitation = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching recitation data:", error);
        setError("Error fetching recitation data");
        return null;
      }
    };

    const fetchAllData = async () => {
      const dataPromises = recitations.map(fetchRecitationData);
      const dataResults = await Promise.all(dataPromises);
      setRecitationData(dataResults.filter(Boolean) as Recitation[]);
    };

    if (recitations.length > 0) {
      fetchAllData();
    }
  }, [recitations]);

  const handlePlay = (attachment: Attachment) => {
    if (audio && playingAttachment === attachment.id) {
      audio.pause();
      setPlayingAttachment(null);
      return;
    }

    if (audio) audio.pause();

    const newAudio = new Audio(attachment.url);
    newAudio.play();
    setAudio(newAudio);
    setPlayingAttachment(attachment.id);

    newAudio.ontimeupdate = () => setProgress((newAudio.currentTime / newAudio.duration) * 100);
    newAudio.onended = () => {
      setProgress(0);
      setPlayingAttachment(null);
    };
  };
// const handleDownload = async (url: string, filename: string) => {
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     const blobUrl = window.URL.createObjectURL(blob);

//     const link = document.createElement('a');
//     link.href = blobUrl;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     // تحرير الذاكرة بعد التحميل
//     window.URL.revokeObjectURL(blobUrl);
//   } catch (error) {
//     console.error("Download error:", error);
//   }
// };

  return (
    <div>
      <h1>التلاوات</h1>
      <ul>
        {recitationData.length > 0 ? (
          recitationData.map((recitation, index) => (
            <li key={recitations[index]}>
              <Drawer>
                <DrawerTrigger asChild>
                  <h2 style={{ cursor: "pointer" }}>
                    {recitation.title} - {recitation.attachments.length} مرفقات
                  </h2>
                </DrawerTrigger>

                <DrawerContent className="rtl">
                  <ScrollArea className="overflow-auto p-4 h-[30rem]">
                    <DrawerHeader>
                      <DrawerTitle className="rtl">{recitation.title}</DrawerTitle>
                      <DrawerDescription className="rtl">عدد المرفقات: {recitation.attachments.length}</DrawerDescription>
                    </DrawerHeader>
                    <ul>
                      {recitation.attachments.map((attachment) => (
                        <li key={attachment.id} className="flex items-center space-x-4 my-2 w-full">
                          <span>{attachment.title} - {attachment.size}</span>
                           <button onClick={() => handlePlay(attachment)} aria-label="Play" >
                            {playingAttachment === attachment.id ? (
                              <FaPause className="text-blue-500" />
                            ) : (
                              <FaPlay className="text-blue-500" />
                            )}
                          </button>
                          <Progress value={playingAttachment === attachment.id ? progress : 0} className="w-full" />
                          
                          <div className="flex space-x-2">
                            <button aria-label="Favorite">
                              <FaHeart className="text-red-500" />
                            </button>
                           <a href={attachment.url} download aria-label="Download">
                              <FaDownload />
                            </a> 
                         
                          </div>
                        </li>
                      ))}
                    </ul>
                    <DrawerFooter>
                      <Button>Submit</Button>
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </ScrollArea>
                </DrawerContent>
              </Drawer>
            </li>
          ))
        ) : (
          <p>Loading recitations...</p>
        )}
      </ul>
    </div>
  );
};

export default ReciterPage;

