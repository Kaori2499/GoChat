"use client";

import { useEffect } from "react";

import { useStudioStore } from "../lib/studio-kit";
import { PLAYBACK_COMPLETE_DELAY_MS } from "../lib/studio.lib";

/** Drives reveal ticks + auto-complete. Mounted under Studio.Provider. */
export const PlaybackSetup = () => {
  const gapMs = useStudioStore((state) => state.playback.gapMs);
  const isPlaying = useStudioStore((state) => state.playback.isPlaying);
  const visibleCount = useStudioStore((state) => state.playback.visibleCount);
  const selectedId = useStudioStore((state) => state.catalog.selectedId);
  const byChatId = useStudioStore((state) => state.drafts.byChatId);
  const presets = useStudioStore((state) => state.catalog.presets);
  const revealNext = useStudioStore((state) => state.playback.revealNext);
  const completePlayback = useStudioStore(
    (state) => state.playback.completePlayback
  );

  const preset = presets.find((item) => item.id === selectedId);
  const draft = selectedId
    ? (byChatId[selectedId] ??
      (preset ? { messages: preset.messages, title: preset.title } : undefined))
    : undefined;
  const messageCount = draft?.messages.length ?? 0;
  const isComplete = isPlaying && visibleCount >= messageCount;

  useEffect(() => {
    if (!isPlaying || visibleCount >= messageCount) {
      return;
    }
    const timer = window.setTimeout(() => {
      revealNext();
    }, gapMs);
    return () => window.clearTimeout(timer);
  }, [gapMs, isPlaying, messageCount, revealNext, visibleCount]);

  useEffect(() => {
    if (!isComplete) {
      return;
    }
    const timer = window.setTimeout(() => {
      completePlayback();
    }, PLAYBACK_COMPLETE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [completePlayback, isComplete]);

  return null;
};
