"use client";

import { cn } from "@/lib/utils";

import type { NotifClockState, NotifLockScreenProps } from "./notif.types";

const editableFieldClassName =
  "pointer-events-auto rounded-sm outline-none empty:before:text-white/50 empty:before:content-[attr(data-placeholder)] hover:bg-white/10 focus:bg-white/15";

const NotifLockScreen = ({
  clock,
  editable = false,
  onClockChange,
  className,
}: NotifLockScreenProps) => {
  const commit = (patch: Partial<NotifClockState>) => {
    onClockChange?.({ ...clock, ...patch });
  };

  const dateLine = (
    <p className="flex items-center justify-center gap-0 text-[1.05rem] font-medium tracking-wide drop-shadow-md">
      {editable ? (
        <>
          <span
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            role="textbox"
            aria-label="Edit date"
            tabIndex={0}
            data-placeholder="日付"
            className={cn(editableFieldClassName, "px-0.5")}
            onBlur={(event) => {
              const next = event.currentTarget.textContent?.trim() ?? "";
              if (next && next !== clock.datePart) {
                commit({ datePart: next });
              } else if (!next) {
                event.currentTarget.textContent = clock.datePart;
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          >
            {clock.datePart}
          </span>
          <span
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            role="textbox"
            aria-label="Edit weekday"
            tabIndex={0}
            data-placeholder="曜日"
            className={cn(editableFieldClassName, "px-0.5")}
            onBlur={(event) => {
              const next = event.currentTarget.textContent?.trim() ?? "";
              if (next && next !== clock.weekday) {
                commit({ weekday: next });
              } else if (!next) {
                event.currentTarget.textContent = clock.weekday;
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          >
            {clock.weekday}
          </span>
        </>
      ) : (
        <span>
          {clock.datePart}
          {clock.weekday}
        </span>
      )}
    </p>
  );

  const timeNode = editable ? (
    <span
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label="Edit time"
      tabIndex={0}
      data-placeholder="0:00"
      className={cn(
        editableFieldClassName,
        "mt-1 inline-block px-1 text-[5.25rem] leading-none font-semibold tracking-tight drop-shadow-lg"
      )}
      onBlur={(event) => {
        const next = event.currentTarget.textContent?.trim() ?? "";
        if (next && next !== clock.timeLabel) {
          commit({ timeLabel: next });
        } else if (!next) {
          event.currentTarget.textContent = clock.timeLabel;
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {clock.timeLabel}
    </span>
  ) : (
    <p className="mt-1 text-[5.25rem] leading-none font-semibold tracking-tight drop-shadow-lg">
      {clock.timeLabel}
    </p>
  );

  return (
    <div
      data-slot="notif-lock-screen"
      className={cn(
        "pointer-events-none relative z-10 flex shrink-0 flex-col items-center px-6 pt-14 text-white",
        className
      )}
    >
      {dateLine}
      {timeNode}
    </div>
  );
};

NotifLockScreen.displayName = "Notif.LockScreen";

export { NotifLockScreen };
