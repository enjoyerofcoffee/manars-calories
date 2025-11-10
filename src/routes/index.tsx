import { createFileRoute } from "@tanstack/react-router";
import { DayPicker } from "react-day-picker";
import React, { useRef, useState, type SyntheticEvent } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Graphs } from "@/components/Graphs";
import type { Meal, MealRow } from "@/types";

export const Route = createFileRoute("/")({
  component: App,
});

type CaloriesConfigRow = {
  id: string | number;
  total_calories: number;
};

type Data = {
  configId: string | number | null;
  totalCalories: number;
  meals: Meal[];
};

async function fetchCaloriesForDay(day: Date): Promise<Data> {
  const from = startOfDay(day).toISOString();
  const to = endOfDay(day).toISOString();

  // get first row from calories_config
  const { data: config, error: configError } = await supabase
    .from("calories_config")
    .select("id,total_calories")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (configError) throw configError;

  const { data: meals, error: mealsError } = await supabase
    .from("meals")
    .select("*")
    .gte("time", from)
    .lt("time", to)
    .order("time", { ascending: false });

  if (mealsError) throw mealsError;

  const mapped: Meal[] =
    (meals as MealRow[] | null)?.map((m) => ({
      id: m.id,
      name: m.meal_name,
      calories: Number(m.meal_calories) || 0,
      time: m.time ? new Date(m.time) : null,
    })) ?? [];

  return {
    configId: (config as CaloriesConfigRow | null)?.id ?? null,
    totalCalories: (config as CaloriesConfigRow | null)?.total_calories ?? 0,
    meals: mapped,
  };
}

type AddMealVars = {
  meal_name: string;
  meal_calories: number;
  time?: string; // ISO string (optional)
};

type UpdateMealVars = {
  id: string;
  meal_name: string;
  meal_calories: number;
};

type DeleteMealVars = {
  id: string;
};

type UpdateCaloriesVars = {
  id: string | number;
  total_calories: number;
};

function App() {
  const [date, setDate] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);

  // Add dialog
  const addDialogRef = useRef<HTMLDialogElement>(null);

  // Edit meal dialog state
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editName, setEditName] = useState("");
  const [editCalories, setEditCalories] = useState<number | string>("");

  // Delete dialog state
  const [deletingMeal, setDeletingMeal] = useState<Meal | null>(null);

  // Edit daily goal dialog state
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [editGoalValue, setEditGoalValue] = useState<string>("");

  const [activeTab, setActiveTab] = useState("tab1");

  const queryClient = useQueryClient();

  // Query meals & config for the *selected* date
  const { data, isLoading, isError, error } = useQuery<Data>({
    queryKey: ["meals-and-config", date.toDateString()],
    queryFn: () => fetchCaloriesForDay(date),
  });

  const consumed = (data?.meals ?? []).reduce(
    (sum, m) => sum + (m.calories || 0),
    0
  );
  const calories = data?.totalCalories ?? 0;
  const remaining = calories - consumed;
  const leftPct = calories > 0 ? Math.min(100, (consumed / calories) * 100) : 0;

  const formatted = format(date, "EEEE, MMMM do yyyy");

  const handleChange = (d?: Date) => {
    if (!d) return;
    setDate(d);
    setIsOpen(false);
  };

  const openAddModal = () => addDialogRef.current?.showModal();
  const closeAddModal = () => addDialogRef.current?.close();

  // -------- ADD --------
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
      queryClient.invalidateQueries({
        queryKey: ["meals-and-config", date.toDateString()],
      });
      closeAddModal();
    },
  });

  const handleAddSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const meal_name = String(formData.get("mealname") ?? "").trim();
    const meal_calories = Number(formData.get("calories") ?? 0);

    if (!meal_name || Number.isNaN(meal_calories) || meal_calories <= 0) return;

    addMeal.mutate({
      meal_name,
      meal_calories,
      time: new Date().toISOString(),
    });

    form.reset();
  };

  // -------- EDIT MEAL --------
  const updateMeal = useMutation({
    mutationFn: async (values: UpdateMealVars) => {
      const { data, error } = await supabase
        .from("meals")
        .update({
          meal_name: values.meal_name,
          meal_calories: values.meal_calories,
        })
        .eq("id", values.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meals-and-config", date.toDateString()],
      });
      setEditingMeal(null);
    },
  });

  const openEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setEditName(meal.name);
    setEditCalories(meal.calories);
  };

  const closeEditMeal = () => setEditingMeal(null);

  const handleEditMealSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMeal) return;

    const name = String(editName ?? "").trim();
    const calsNum = Number(editCalories);

    if (!name || Number.isNaN(calsNum) || calsNum <= 0) return;

    updateMeal.mutate({
      id: editingMeal.id,
      meal_name: name,
      meal_calories: calsNum,
    });
  };

  // -------- DELETE MEAL --------
  const deleteMeal = useMutation({
    mutationFn: async ({ id }: DeleteMealVars) => {
      const { error } = await supabase.from("meals").delete().eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meals-and-config", date.toDateString()],
      });
      setDeletingMeal(null);
    },
  });

  const openDelete = (meal: Meal) => setDeletingMeal(meal);
  const closeDelete = () => setDeletingMeal(null);

  // -------- UPDATE DAILY GOAL (first row) --------
  const updateCaloriesConfig = useMutation({
    mutationFn: async ({ id, total_calories }: UpdateCaloriesVars) => {
      const { data, error } = await supabase
        .from("calories_config")
        .update({ total_calories })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as CaloriesConfigRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meals-and-config", date.toDateString()],
      });
      setEditGoalOpen(false);
    },
  });

  const openEditGoal = () => {
    // if there is no config row, we still allow typing a value
    setEditGoalValue(calories ? String(calories) : "");
    setEditGoalOpen(true);
  };

  const handleEditGoalSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data?.configId) return; // only updating existing first row as requested
    const val = Number(editGoalValue);
    if (Number.isNaN(val) || val <= 0) return;

    updateCaloriesConfig.mutate({
      id: data.configId,
      total_calories: val,
    });
  };

  return (
    <div className="relative my-4 flex flex-col items-center">
      <div role="tablist" className="tabs tabs-box mb-2">
        <button
          role="tab"
          className={`tab ${activeTab === "tab1" && "tab-active"}`}
          onClick={() => setActiveTab("tab1")}
        >
          Calories
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "tab2" && "tab-active"}`}
          onClick={() => setActiveTab("tab2")}
        >
          Graphs
        </button>
      </div>
      {/* Date button / popover */}
      {activeTab === "tab1" && (
        <>
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
                  visibility: leftPct === 0 ? "hidden" : "visible",
                  "--value": leftPct,
                  "--size": "12rem",
                  "--thickness": "10px",
                } as React.CSSProperties
              }
              aria-valuenow={leftPct}
              role="progressbar"
            >
              <div className="flex flex-col items-center visible">
                <span className="text-xs opacity-70">REMAINING</span>
                {isLoading ? (
                  <span className="mt-2 loading loading-spinner "></span>
                ) : (
                  <span
                    className={`text-2xl font-bold ${remaining < 0 && "text-red-600"} ${leftPct > 75 && "text-orange-500"}`}
                  >
                    {remaining}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center text-center">
              <div
                className="flex cursor-pointer flex-col"
                onClick={openEditGoal}
                title="Edit daily goal"
              >
                <span className="text-sm opacity-70">DAILY GOAL</span>
                {isLoading ? (
                  <span className="loading loading-spinner self-center mt-2"></span>
                ) : (
                  <span className="text-xl font-bold underline decoration-dotted underline-offset-4">
                    {calories}
                  </span>
                )}
              </div>
              <div className="divider divider-horizontal" />
              <div className="flex flex-col">
                <span className="text-sm opacity-70">CONSUMED</span>
                {isLoading ? (
                  <span className="loading loading-spinner self-center mt-2"></span>
                ) : (
                  <>
                    <span className="text-xl font-bold">{consumed}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Add meal dialog */}
          <dialog ref={addDialogRef} className="modal">
            <div className="modal-box">
              <h3 className="text-2xl font-bold">Add meal</h3>

              <form onSubmit={handleAddSubmit}>
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
                  <div className="mt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => addDialogRef.current?.close()}
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
          {isLoading && (
            <span className="loading loading-ring loading-xl mt-2"></span>
          )}
          {isError && (
            <div className="mt-6 text-error">
              {(error as Error)?.message ?? "Failed to load data"}
            </div>
          )}

          <ul className="list w-84 rounded-box bg-base-100 shadow-md">
            {(data?.meals ?? []).map((meal) => (
              <li key={meal.id} className="list-row flex w-full flex-col p-3">
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
                    <button
                      className="btn btn-square btn-ghost"
                      onClick={() => openEditMeal(meal)}
                      aria-label={`Edit ${meal.name}`}
                    >
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
                    <button
                      className="btn btn-square btn-ghost"
                      onClick={() => openDelete(meal)}
                      aria-label={`Delete ${meal.name}`}
                    >
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
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Add button */}
          <div className="sticky bottom-0 z-10 mt-4 bg-base-100 py-4">
            <button className="btn w-84" onClick={openAddModal}>
              Add Meal
            </button>
          </div>

          {/* EDIT Meal Dialog */}
          {editingMeal && (
            <dialog className="modal" open>
              <div className="modal-box">
                <h3 className="text-2xl font-bold">Edit meal</h3>
                <form onSubmit={handleEditMealSubmit}>
                  <div className="modal-action flex flex-col gap-3">
                    <input
                      required
                      type="text"
                      placeholder="Meal name"
                      className="input w-full"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="Calories"
                      className="input w-full"
                      value={editCalories}
                      onChange={(e) => setEditCalories(e.target.value)}
                    />
                    <div className="mt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={closeEditMeal}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={updateMeal.isPending}
                      >
                        {updateMeal.isPending ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </dialog>
          )}

          {/* DELETE Dialog */}
          {deletingMeal && (
            <dialog className="modal" open>
              <div className="modal-box">
                <h3 className="text-2xl font-bold">Delete meal</h3>
                <p className="mt-2">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{deletingMeal.name}</span>?
                </p>
                <div className="modal-action flex justify-end gap-3">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closeDelete}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={() =>
                      deleteMeal.mutate({
                        id: deletingMeal.id,
                      })
                    }
                    disabled={deleteMeal.isPending}
                  >
                    {deleteMeal.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </dialog>
          )}

          {/* EDIT DAILY GOAL Dialog */}
          {editGoalOpen && (
            <dialog className="modal" open>
              <div className="modal-box">
                <h3 className="text-2xl font-bold">Edit daily goal</h3>
                {!data?.configId ? (
                  <p className="mt-2 text-warning">
                    No row found in <code>calories_config</code>. Create one
                    first to enable editing.
                  </p>
                ) : null}
                <form onSubmit={handleEditGoalSubmit}>
                  <div className="modal-action flex flex-col gap-3">
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="Total calories"
                      className="input w-full"
                      value={editGoalValue}
                      onChange={(e) => setEditGoalValue(e.target.value)}
                    />
                    <div className="mt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setEditGoalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={
                          updateCaloriesConfig.isPending || !data?.configId
                        }
                      >
                        {updateCaloriesConfig.isPending ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </dialog>
          )}
        </>
      )}
      {activeTab === "tab2" && (
        <>
          <Graphs baseline={calories} />
        </>
      )}
    </div>
  );
}
