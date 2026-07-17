"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import type { RefObject } from "react";

import { useDictionary } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { downloadElementPng } from "@/lib/export-png";

export const StudioNotifExport = ({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) => {
  const dict = useDictionary();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = targetRef.current;
    if (!element || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await downloadElementPng(element, `gochat-notif-${Date.now()}.png`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div data-slot="studio-notif-export">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {dict.export.label}
      </p>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isExporting}
        onClick={() => {
          void handleExport();
        }}
      >
        <Download />
        {isExporting ? dict.export.exporting : dict.export.button}
      </Button>
    </div>
  );
};
