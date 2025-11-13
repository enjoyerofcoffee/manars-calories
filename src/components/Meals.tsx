import type { Meal, Notes } from "@/types";
import { format, isSameDay } from "date-fns";

type MealsProps = {
  meals?: Meal[];
  notes?: Notes[];
};

export const Meals: React.FC<MealsProps> = ({ meals, notes }) => {
  const mealsArray = meals ?? [];
  const notesArray = notes ?? [];

  // Build a combined, time-sorted list of meals + notes
  const combined = [
    ...mealsArray.map((m) => ({
      type: "meal" as const,
      time: m.time ?? null,
      item: m,
    })),
    ...notesArray.map((n) => ({
      type: "note" as const,
      time: n.time ?? null, // used only for sorting + day grouping
      item: n,
    })),
  ].sort((a, b) => {
    const ta = a.time ? a.time.getTime() : 0;
    const tb = b.time ? b.time.getTime() : 0;
    return tb - ta; // newest → oldest
  });

  let lastDate: Date | null = null;

  if (combined.length === 0) {
    return (
      <ul className="list w-84 rounded-box bg-base-100 shadow-md mb-4">
        <li className="p-3 text-sm opacity-70">No meals or notes yet.</li>
      </ul>
    );
  }

  return (
    <ul className="list w-84 rounded-box bg-base-100 shadow-md mb-4">
      {combined.map((entry, idx) => {
        const { type, time, item } = entry;
        const showDivider = time && (!lastDate || !isSameDay(time, lastDate));
        if (time) lastDate = time;

        const keyPrefix = type === "meal" ? "meal" : "note";
        const id = (item as any).id ?? idx;

        return (
          <div key={`${keyPrefix}-${id}-${idx}`}>
            {showDivider && time && (
              <li className="divider text-xs opacity-70">
                {format(time, "EEE d MMM yyyy")}
              </li>
            )}

            {type === "meal" ? (
              <li className="list-row flex w-full flex-col p-3">
                <div className="flex w-full items-start justify-between">
                  <div className="text-lg">{item.name}</div>
                  <span className="min-w-[4.5rem] text-end">
                    {time ? format(time, "hh:mm a") : "--:--"}
                  </span>
                </div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="text-end text-xs uppercase font-semibold opacity-60">
                    {item.calories} calories
                  </div>
                </div>
              </li>
            ) : (
              <li className="list-row flex flex-col px-3 pb-3 pt-1">
                <div className="collapse collapse-arrow">
                  <input type="checkbox" />
                  <div className="collapse-title font-semibold">
                    Notes
                    {/* 👇 no time for notes anymore */}
                  </div>
                  <div className="collapse-content text-sm">
                    <p className="text-sm italic opacity-80">{item.text}</p>
                  </div>
                </div>
              </li>
            )}
          </div>
        );
      })}
    </ul>
  );
};
