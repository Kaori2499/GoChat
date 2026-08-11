"use client";

import { useEffect } from "react";

import { useStudioStore } from "../lib/studio-kit";

/** Drives reveal ticks + auto-complete. Mounted under Studio.Provider. */
export const PlaybackSetup = () => {
  const gapMs = useStudioStore((state) => state.playback.gapMs);
  const firstMessageDelayMs = useStudioStore(
    (state) => state.playback.firstMessageDelayMs
  );
  const completeDelayMs = useStudioStore(
    (state) => state.playback.completeDelayMs
  );
  const timeScale = useStudioStore((state) => state.playback.timeScale);
  const autoReveal = useStudioStore((state) => state.playback.autoReveal);
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

  const scaledGapMs = gapMs / timeScale;
  const scaledFirstDelayMs = firstMessageDelayMs / timeScale;
  const scaledCompleteDelayMs = completeDelayMs / timeScale;

  useEffect(() => {
    if (!isPlaying || !autoReveal || visibleCount >= messageCount) {
      return;
    }
    const delayMs = visibleCount === 0 ? scaledFirstDelayMs : scaledGapMs;
    const timer = window.setTimeout(() => {
      revealNext();
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [
    autoReveal,
    isPlaying,
    messageCount,
    revealNext,
    scaledFirstDelayMs,
    scaledGapMs,
    visibleCount,
  ]);

  useEffect(() => {
    if (!isComplete || !autoReveal) {
      return;
    }
    const timer = window.setTimeout(() => {
      completePlayback();
    }, scaledCompleteDelayMs);
    return () => window.clearTimeout(timer);
  }, [autoReveal, completePlayback, isComplete, scaledCompleteDelayMs]);

  return null;
};
