import { createFileRoute } from "@tanstack/react-router";
import { DayPicker } from "react-day-picker";
import React, { useRef, useState, type SyntheticEvent } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: App,
});

type MealRow = {
  id: string;
  meal_name: string;
  meal_calories: number;
  created_at: string; // timestamptz in DB
  time?: string | null; // optional timestamptz or time
};

type Meal = {
  name: string;
  calories: number;
  time?: Date | null;
};

type Data = {
  totalCalories: number;
  meals: Meal[];
};

async function fetchCaloriesForDay(day: Date): Promise<Data> {
  const from = startOfDay(day).toISOString();
  const to = endOfDay(day).toISOString();

  const caloriesQuery = supabase
    .from("calories_config")
    .select("total_calories")
    .limit(1)
    .maybeSingle();

  const mealsQuery = supabase
    .from("meals")
    .select("*")
    .gte("time", from)
    .lt("time", to);

  const [
    { data: config, error: configError },
    { data: meals, error: mealsError },
  ] = await Promise.all([caloriesQuery, mealsQuery]);

  if (configError) throw configError;
  if (mealsError) throw mealsError;

  const totalCalories = config?.total_calories ?? 0;

  const mapped: Meal[] =
    (meals as MealRow[] | null)?.map((m) => ({
      name: m.meal_name,
      calories: Number(m.meal_calories) || 0,
      time: m.time ? new Date(m.time) : null,
    })) ?? [];

  return { totalCalories, meals: mapped };
}

type AddMealVars = {
  meal_name: string;
  meal_calories: number;
  time?: string; // ISO string (optional)
};

function App() {
  const [date, setDate] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const openMealRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();

  // Query meals & config for the *selected* date
  const { data, isLoading, isError, error } = useQuery<Data>({
    queryKey: ["meals-and-config", date.toDateString()],
    queryFn: () => fetchCaloriesForDay(date),
  });

  // Compute consumed from meals; fall back to 0 if none
  const consumed = (data?.meals ?? []).reduce(
    (sum, m) => sum + (m.calories || 0),
    0
  );
  const calories = data?.totalCalories ?? 0;
  const remaining = Math.max(0, calories - consumed);
  const leftPct = calories > 0 ? Math.min(100, (consumed / calories) * 100) : 0;

  const formatted = format(date, "EEEE, MMMM do yyyy");

  const handleChange = (d?: Date) => {
    if (!d) return;
    setDate(d);
    setIsOpen(false);
  };

  const openModal = () => openMealRef.current?.showModal();
  const closeModal = () => openMealRef.current?.close();

  const addMeal = useMutation({
    mutationFn: async (values: AddMealVars) => {
      const { data, error } = await supabase
        .from("meals")
        .insert({
          meal_name: values.meal_name,
          meal_calories: values.meal_calories,
          time: values.time ?? new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // refresh the list for the current date
      queryClient.invalidateQueries({
        queryKey: ["meals-and-config", date.toDateString()],
      });
      closeModal();
    },
  });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const meal_name = String(formData.get("mealname") ?? "").trim();
    const meal_calories = Number(formData.get("calories") ?? 0);

    if (!meal_name || Number.isNaN(meal_calories) || meal_calories <= 0) return;

    addMeal.mutate({
      meal_name,
      meal_calories,
      // Save with the selected date's day, current time (or set a custom time field if you have one)
      time: new Date().toISOString(),
    });

    // Reset fields (the dialog will close on success)
    form.reset();
  };

  return (
    <div className="relative my-4 flex flex-col items-center">
      {/* Date button / popover */}
      <button
        onClick={() => setIsOpen(true)}
        popoverTarget="rdp-popover"
        className="input input-bordered mb-4"
        style={{ anchorName: "--rdp" } as React.CSSProperties}
      >
        {formatted}
      </button>

      {isOpen && (
        <div
          popover="auto"
          id="rdp-popover"
          className="dropdown"
          style={{ positionAnchor: "--rdp" } as React.CSSProperties}
        >
          <DayPicker
            required
            className="react-day-picker"
            mode="single"
            selected={date}
            onSelect={handleChange}
          />
        </div>
      )}

      {/* Summary header */}
      <div className="sticky top-4 z-10 flex w-full flex-col items-center space-y-6 bg-base-100 pb-4">
        <div
          className="radial-progress"
          style={
            {
              "--value": leftPct,
              "--size": "12rem",
              "--thickness": "10px",
            } as React.CSSProperties
          }
          aria-valuenow={leftPct}
          role="progressbar"
        >
          <div className="flex flex-col items-center">
            <span className="text-xs opacity-70">REMAINING</span>
            <span className="text-2xl font-bold">{remaining}</span>
          </div>
        </div>

        <div className="flex items-center text-center">
          <div className="flex flex-col">
            <span className="text-sm opacity-70">DAILY GOAL</span>
            <span className="text-xl font-bold">{calories}</span>
          </div>
          <div className="divider divider-horizontal" />
          <div className="flex flex-col">
            <span className="text-sm opacity-70">CONSUMED</span>
            <span className="text-xl font-bold">{consumed}</span>
          </div>
        </div>
      </div>

      {/* Add meal dialog */}
      <dialog ref={openMealRef} className="modal">
        <div className="modal-box">
          <h3 className="text-2xl font-bold">Add meal</h3>

          <form onSubmit={handleSubmit}>
            <div className="modal-action flex flex-col gap-3">
              <input
                required
                name="mealname"
                type="text"
                placeholder="Meal name"
                className="input w-full"
              />
              <input
                required
                name="calories"
                min="1"
                type="number"
                placeholder="Calories"
                className="input w-full"
              />
              <div className="mt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={addMeal.isPending}
                >
                  {addMeal.isPending ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </dialog>

      {/* Meals list */}
      {isLoading && <div className="mt-6 opacity-70">Loading…</div>}
      {isError && (
        <div className="mt-6 text-error">
          {(error as Error)?.message ?? "Failed to load data"}
        </div>
      )}

      <ul className="list min-h-[8rem] w-full max-w-xl rounded-box bg-base-100 shadow-md">
        {(data?.meals ?? []).map((meal, idx) => (
          <li key={idx} className="list-row flex w-full flex-col p-3">
            <div className="flex w-full items-start justify-between">
              <div className="text-lg">{meal.name}</div>
              <span className="min-w-[4.5rem] text-end">
                {meal.time ? format(meal.time, "HH:mm a") : "--:--"}
              </span>
            </div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-end text-xs uppercase font-semibold opacity-60">
                {meal.calories} calories
              </div>
              <div className="flex gap-1">
                <button className="btn btn-square btn-ghost m-0 p-0">
                  {/* Delete icon */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    role="img"
                  >
                    <path d="M4 7h16" />
                    <path d="M9 7v-1.5c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5V7" />
                    <path d="M6.5 7l.9 11.2c.1 1.1 1 1.8 2.1 1.8h4.9c1.1 0 2-.8 2.1-1.8L18.5 7" />
                    <path d="M10 11l.3 6" />
                    <path d="M14 11l-.3 6" />
                  </svg>
                </button>
                <button className="btn btn-square btn-ghost">
                  {/* Edit icon */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    role="img"
                  >
                    <path d="M4 20h4l9.4-9.4a1.5 1.5 0 0 0 0-2.1l-2.9-2.9a1.5 1.5 0 0 0-2.1 0L5 15v5z" />
                    <path d="M13.5 6.5l4 4" />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Add button */}
      <div className="sticky bottom-0 z-10 w-full max-w-xl bg-base-100 py-4">
        <button className="btn w-full" onClick={openModal}>
          Add Meal
        </button>
      </div>
    </div>
  );
}
