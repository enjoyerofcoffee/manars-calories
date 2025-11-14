import { supabase } from "@/db";
import type { Meal, MealRow, Notes, NotesRow } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DayPicker, type DateRange } from "react-day-picker";
import { Meals } from "./Meals";

const BMRCalories = 1500;

/** ===== Types ===== */
type ChartPoint = { dayStart: number; calories: number | null };

type Data = {
  meals: Meal[];
  notes: Notes[];
};

/** ===== Utils ===== */
const atLocalMidnight = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()); // 00:00 local time

/** ===== Data fetch ===== */
const fetchMeals = async (range?: DateRange) => {
  if (!range?.to || !range?.from) {
    throw new Error("Wrong time range");
  }

  const from = startOfDay(range.from).toISOString();
  const to = endOfDay(range.to).toISOString();

  const mealsQuery = supabase
    .from("meals")
    .select("*")
    .gte("time", from)
    .lte("time", to);

  const notesQuery = supabase
    .from("notes")
    .select("*")
    .gte("time", from)
    .lte("time", to);

  const { data: mealsData, error: mealsError } = await mealsQuery;

  const { data: notesData } = await notesQuery;

  if (mealsError) {
    console.error(mealsError);
    throw mealsError;
  }

  const mapped: Meal[] =
    (mealsData as MealRow[] | null)?.map((m) => ({
      id: m.id,
      name: m.meal_name,
      calories: Number(m.meal_calories) || 0,
      time: m.time ? new Date(m.time) : null,
    })) ?? [];

  const mappedNotes: Notes[] =
    (notesData as NotesRow[] | null)?.map((n) => ({
      id: n.id,
      text: n.text,
      time: n.time ? new Date(n.time) : null,
    })) ?? [];

  const response: Data = {
    meals: mapped,
    notes: mappedNotes,
  };

  return response;
};

/** ===== Transform with buffer & fill =====
 * - Aggregates by local midnight
 * - X axis = time (dayStart ms), Y axis = calories
 * - Pads the selected range by `bufferDays` on both sides and fills missing days with 0
 */
export function transformData(
  mealsData?: Meal[],
  range?: DateRange,
  bufferDays = 7
): ChartPoint[] {
  if (!mealsData?.length) return [];

  // 1) Aggregate calories per day
  const totals = new Map<number, number>();
  for (const m of mealsData) {
    if (!m.time) continue;
    const ms = startOfDay(m.time).getTime();
    totals.set(ms, (totals.get(ms) ?? 0) + (m.calories || 0));
  }

  // 2) If we have a range, pad both sides and fill gaps with 0
  if (range?.from && range?.to) {
    const from = startOfDay(range.from);
    const to = startOfDay(range.to);

    const paddedFrom = startOfDay(addDays(from, -bufferDays));
    const paddedTo = startOfDay(addDays(to, bufferDays));

    const out: ChartPoint[] = [];
    for (
      let d = paddedFrom;
      d.getTime() <= paddedTo.getTime();
      d = addDays(d, 1)
    ) {
      const ms = d.getTime();
      out.push({ dayStart: ms, calories: totals.get(ms) ?? null });
    }
    return out;
  }

  // 3) No range → return only observed days
  return Array.from(totals.entries())
    .map(([dayStart, calories]) => ({ dayStart, calories }))
    .sort((a, b) => a.dayStart - b.dayStart);
}

type GraphsProps = {
  baseline?: number;
};

/** ===== Component ===== */
export const Graphs: React.FC<GraphsProps> = ({ baseline }) => {
  // Default: last 7 days inclusive (today + previous 6)
  const today = atLocalMidnight(new Date());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [range, setRange] = useState<DateRange | undefined>({
    from: sevenDaysAgo,
    to: today,
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const { data: dataResponse, isLoading } = useQuery<Data>({
    queryKey: [
      "meals-and-config",
      range?.from?.toDateString(),
      range?.to?.toDateString(),
    ],
    queryFn: () => fetchMeals(range),
  });

  const data = useMemo(
    () => transformData(dataResponse?.meals, range, 1),
    [dataResponse?.meals, range]
  );

  const onSelect = (r?: DateRange) => {
    setRange(r);
    setShowCalendar(false);
  };

  const hasAboveBMR = data.find((point) => (point.calories || 0) > BMRCalories);

  return (
    <>
      <button
        popoverTarget="rdp-popover"
        className="input input-border"
        style={{ anchorName: "--rdp" } as React.CSSProperties}
        onClick={() => setShowCalendar(true)}
      >
        {range?.from && range?.to
          ? `${format(range.from, "EEE d MMM yyyy")} to ${format(
              range.to,
              "EEE d MMM yyyy"
            )}`
          : "Select range"}
      </button>

      {showCalendar && (
        <div
          popover="auto"
          id="rdp-popover"
          className="dropdown"
          style={{ positionAnchor: "--rdp" } as React.CSSProperties}
        >
          <DayPicker
            className="react-day-picker"
            mode="range"
            selected={range}
            onSelect={onSelect}
            numberOfMonths={2}
          />
        </div>
      )}

      {isLoading && (
        <span className="loading loading-ring loading-xl mt-4"></span>
      )}

      {dataResponse && !isLoading && (
        <div
          style={{
            width: "90%",
            maxWidth: 800,
            height: 420,
            marginRight: 64,
            marginTop: 16,
          }}
        >
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 16, right: 24, left: 16, bottom: 16 }}
            >
              {/* X = time (ms) */}
              <XAxis
                dataKey="dayStart"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(ms) => format(new Date(ms as number), "d MMM")}
                tickLine={false}
                axisLine={false}
              />
              {/* Y = calories */}
              <YAxis
                dataKey="calories"
                type="number"
                tickLine={false}
                width={60}
                tickFormatter={(value) => (value === 0 ? "" : value)}
              />
              <Tooltip
                labelFormatter={(ms) =>
                  format(new Date(ms as number), "EEE d MMM yyyy")
                }
                formatter={(value: any, name: string) =>
                  name === "calories" ? [value, "Calories"] : [value, name]
                }
                contentStyle={{ borderRadius: 8 }}
              />
              <ReferenceLine
                y={baseline} // the Y-value to draw the line
                stroke="red" // line color
                strokeDasharray="4 4" // dashed style
              />
              <ReferenceLine
                y={1500} // the Y-value to draw the line
                stroke="blue" // line color
                strokeDasharray="4 4" // dashed style
              />
              <Legend
                content={() => (
                  <div className="flex space-x-4 ml-16 mt-2">
                    <div className="text-xs text-red-400">
                      Base calories - - -{" "}
                    </div>
                    {hasAboveBMR && (
                      <div className="text-xs text-blue-600">BMR - - - </div>
                    )}
                  </div>
                )}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#8884d8"
                dot={{ r: 3 }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {isLoading && <div className="pt-4 text-sm opacity-70">Loading…</div>}
      {!isLoading && data.length === 0 && (
        <div role="alert" className="alert alert-error alert-soft m-4">
          No meals in this range 😢 please pick a different time peroid
        </div>
      )}
      <Meals meals={dataResponse?.meals} notes={dataResponse?.notes} />
    </>
  );
};

export default Graphs;
