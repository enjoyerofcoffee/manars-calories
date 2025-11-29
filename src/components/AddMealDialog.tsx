import { useEffect, useState } from "react";
import { CalculatorButton } from "./CalulcatorButton";
import { FoodInfoButton } from "./FoodInfoButton";
import { Calculator } from "./Calculator/Calculator";
import { FoodInfo } from "./FoodInfo";

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
  const [openFoodInfo, setOpenFoodInfo] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) return;

    const onResize = () => {
      const keyboardHeight =
        window.innerHeight - viewport.height - viewport.offsetTop;

      // only apply if keyboard is visible
      setKeyboardOffset(keyboardHeight > 0 ? keyboardHeight : 0);
    };

    viewport.addEventListener("resize", onResize);
    return () => viewport.removeEventListener("resize", onResize);
  }, []);

  const onClickCalulcator = () => {
    setOpenCalulcator(!openCalculator);
    setOpenFoodInfo(false);
  };

  const onClickFoodInfo = () => {
    setOpenFoodInfo(!openFoodInfo);
    setOpenCalulcator(false);
  };

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
                <CalculatorButton onClick={onClickCalulcator} />
                <FoodInfoButton onClick={onClickFoodInfo} />
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
        <div
          className="absolute left-1/2 top-full w-full mt-2 rounded shadow"
          style={{
            transform: `translate(-50%, -${keyboardOffset}px)`,
          }}
        >
          {openCalculator && <Calculator />}
          {openFoodInfo && <FoodInfo />}
        </div>
      </div>
    </dialog>
  );
};
