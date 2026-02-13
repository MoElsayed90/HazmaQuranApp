"use client";

import { type ReactNode } from "react";
import { AudioPlayerContext, useAudioPlayer } from "@/hooks/use-audio-player";

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioPlayer = useAudioPlayer();

  return (
    <AudioPlayerContext.Provider value={audioPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
