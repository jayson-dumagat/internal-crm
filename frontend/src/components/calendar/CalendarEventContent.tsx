type CalendarEventContentProps = {
  timeText: string;
  title: string;
  backgroundColor?: string;
};

export default function CalendarEventContent({
  timeText,
  title,
  backgroundColor = "#465fff",
}: CalendarEventContentProps) {
  return (
    <div
      className="flex h-full w-full min-w-0 items-center gap-1 overflow-hidden rounded-sm px-1.5 py-0.5 text-xs text-white"
      style={{ backgroundColor }}
    >
      {timeText && <span className="shrink-0 font-medium">{timeText}</span>}
      <span className="truncate">{title}</span>
    </div>
  );
}
