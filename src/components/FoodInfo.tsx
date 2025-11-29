import { supabase } from "@/db";
import type { FoodInformation } from "@/types";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, type SyntheticEvent } from "react";

type AddNotes = {
  name: string;
  notes: string;
};

const fetchFoodInformation = async () => {
  const { data } = await supabase.from("food_info").select();

  const mapped: FoodInformation[] =
    (data as FoodInformation[] | null)?.map((m) => ({
      id: m.id,
      name: m.name,
      notes: m.notes,
    })) ?? [];

  return mapped;
};

export const FoodInfo: React.FC = () => {
  const [saveToast, setSaveToast] = useState(false);
  const { data, isLoading, refetch } = useQuery<FoodInformation[]>({
    queryKey: ["addMeals"],
    queryFn: () => fetchFoodInformation(),
  });
  const queryClient = useQueryClient();

  const addNotes = useMutation({
    mutationFn: async (values: AddNotes) => {
      await supabase
        .from("food_info")
        .insert({ name: values.name, notes: values.notes })
        .select()
        .single();
    },

    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addMeals"] }),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) =>
      await supabase.from("food_info").delete().eq("id", id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addMeals"] }),
  });

  const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const formData = new FormData(form);
    addNotes.mutate({
      name: String(formData.get("food_name")),
      notes: String(formData.get("food_notes")),
    });
    setSaveToast(true);
    form.reset();

    refetch();

    setTimeout(() => setSaveToast(false), 1000);
  };

  return (
    <div className="flex flex-col bg-base-100 rounded-box shadow-md pt-2 px-3">
      {isLoading && (
        <div className="loading loading-dots text-primary items-self-center self-center py-4" />
      )}
      <ul className="list max-h-44 overflow-auto">
        {data?.map((information) => (
          <li className="list-row flex py-2">
            <div className="flex-1">
              <div>{information.name}</div>
              <div className="text-xs uppercase font-semibold opacity-60">
                {information.notes}
              </div>
            </div>
            <div className="flex justify-end">
              {/* Edit */}
              {/* <button className="btn btn-square btn-ghost">
                <svg
                  className="size-[1.2em]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <g
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M15 3l6 6L7 21l-4 1 1-4L15 3z" />
                  </g>
                </svg>
              </button> */}
              {/* Delete Button */}
              <button
                className="btn btn-square btn-ghost"
                onClick={() => deleteNote.mutate(information.id)}
              >
                <svg
                  className="size-[1.2em]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <g
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M6 6l1 14h10l1-14" />
                  </g>
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form className="space-y-2 mx-2 mt-2" onSubmit={onSubmit}>
        <input
          required
          type="text"
          name="food_name"
          placeholder="Food name"
          className="input w-full"
        />
        <input
          required
          type="text"
          name="food_notes"
          placeholder="Notes"
          className="input w-full"
        />
        <div className="space-x-2 text-xs py-2 flex justify-end">
          <button className="btn btn btn-xs" type="reset">
            Reset
          </button>
          <button className="btn btn-xs btn-primary" type="submit">
            + Add button
          </button>
        </div>
      </form>
      {saveToast && (
        <div className="toast">
          <div className="alert alert-success">
            <span> Saved</span>
          </div>
        </div>
      )}
    </div>
  );
};
