import { useState } from "react";
import { CalculatorButton } from "./CalulcatorButton";
import { NotesButton } from "./NotesButton";

type AddMealDialogProps = {
  onSubmit?: (e: React.SyntheticEvent<HTMLFormElement, Event>) => void;
  isPending?: boolean;
  ref: React.RefObject<HTMLDialogElement | null>;
};

export const AddMealDialog: React.FC<AddMealDialogProps> = ({
  onSubmit,
  isPending,
  ref,
}) => {
  const [openCalculator, setOpenCalulcator] = useState(false);

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box overflow-visible">
        <h3 className="text-2xl font-bold">Add meal</h3>
        <form onSubmit={onSubmit}>
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
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <CalculatorButton />
                {/* <NotesButton /> */}
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => ref.current?.close()}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={isPending}>
                  {isPending ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
};
