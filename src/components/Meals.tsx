import type { Meal } from "@/types";
import { format, isSameDay } from "date-fns";

type MealsProps = {
  data: Meal[];
};

export const Meals: React.FC<MealsProps> = ({ data }) => {
  const meals = [...(data ?? [])].sort((a, b) => {
    const ta = a.time ? a.time.getTime() : 0;
    const tb = b.time ? b.time.getTime() : 0;
    return ta - tb;
  });

  let lastDate: Date | null = null;

  return (
    <ul className="list w-84 rounded-box bg-base-100 shadow-md mb-4">
      {meals.map((meal) => {
        const showDivider =
          meal.time && (!lastDate || !isSameDay(meal.time, lastDate));
        if (meal.time) lastDate = meal.time;

        return (
          <div key={meal.id}>
            {showDivider && meal.time && (
              <li className="divider text-xs opacity-70">
                {format(meal.time, "EEE d MMM yyyy")}{" "}
                {/* e.g., Sat 3 Nov 2025 */}
              </li>
            )}

            <li className="list-row flex w-full flex-col p-3">
              <div className="flex w-full items-start justify-between">
                <div className="text-lg">{meal.name}</div>
                <span className="min-w-[4.5rem] text-end">
                  {meal.time ? format(meal.time, "hh:mm a") : "--:--"}
                </span>
              </div>
              <div className="mt-1 flex items-end justify-between">
                <div className="text-end text-xs uppercase font-semibold opacity-60">
                  {meal.calories} calories
                </div>
              </div>
            </li>
          </div>
        );
      })}
    </ul>
  );
};
