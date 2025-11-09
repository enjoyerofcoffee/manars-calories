import { createFileRoute } from "@tanstack/react-router";
import { DayPicker } from "react-day-picker";
import {
  useRef,
  useState,
  type FormEventHandler,
  type SyntheticEvent,
} from "react";
import { format } from "date-fns/format";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const [date, setDate] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const openMealRef = useRef<HTMLDialogElement>(null);

  const calories = 2000;
  const consumed = 1421;
  const remaining = calories - consumed;

  const formatted = format(date, "EEEE, MMMM do yyyy");

  const left = (consumed / calories) * 100;

  const handleChange = (date: Date) => {
    setDate(date);
    setIsOpen(false);
  };

  const openModal = () => openMealRef.current?.showModal();

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
  };

  return (
    <div className="relative flex items-center my-4 flex-col">
      <button
        onClick={() => setIsOpen(true)}
        popoverTarget="rdp-popover"
        className="input input-border mb-4"
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
      <div className="sticky top-4 w-full items-center bg-base-100 z-10 flex flex-col space-y-6 pb-4">
        <div
          className="radial-progress"
          style={
            { "--value": left, "--size": "12rem" } /* as React.CSSProperties */
          }
          aria-valuenow={left}
          role="progressbar"
        >
          <div className="flex flex-col items-center">
            <span className="text-xs">REMAINING</span>
            <span className="font-bold text-2xl">{remaining}</span>
          </div>
        </div>
        <div className="flex text-center">
          <div className="flex flex-col ">
            <span className="text-sm">DAILY GOAL</span>
            <span className="text-xl font-bold">{calories}</span>
          </div>
          <div className="divider divider-horizontal" />
          <div className="flex flex-col">
            <span className="text-sm">CONSUMED</span>
            <span className="text-xl font-bold">{consumed}</span>
          </div>
        </div>
      </div>
      <dialog ref={openMealRef} id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-2xl">Add meal</h3>

          <form method="dialog" onSubmit={handleSubmit}>
            <div className="modal-action flex flex-col">
              <input
                name="mealname"
                type="text"
                placeholder="Meal name"
                className="input w-full"
              />
              <input
                name="calories"
                type="number"
                placeholder="Calories"
                className="input w-full"
              />
              <div className="flex justify-end space-x-4 mt-2">
                <button className="btn btn-primary">Cancel</button>
                <button className="btn">Add</button>
              </div>
            </div>
          </form>
        </div>
      </dialog>
      <ul className="list min-h-32 bg-base-100 rounded-box shadow-md overflow-auto">
        <li className="list-row w-84 flex flex-col">
          <div className="flex w-full justify-between">
            <div className="text-lg">Meal 1</div>
            <span className="text-end min-w-18">14:32 pm</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-endtext-xs uppercase font-semibold opacity-60 text-xs">
              1231 calories
            </div>
            <div>
              <button className="btn btn-square btn-ghost m-0 p-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
        <li className="list-row w-84 flex flex-col">
          <div className="flex w-full justify-between">
            <div className="text-lg">Meal 1</div>
            <span className="text-end min-w-18">14:32 pm</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-endtext-xs uppercase font-semibold opacity-60 text-xs">
              1231 calories
            </div>
            <div>
              <button className="btn btn-square btn-ghost m-0 p-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
        <li className="list-row w-84 flex flex-col">
          <div className="flex w-full justify-between">
            <div className="text-lg">Meal 1</div>
            <span className="text-end min-w-18">14:32 pm</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-endtext-xs uppercase font-semibold opacity-60 text-xs">
              1231 calories
            </div>
            <div>
              <button className="btn btn-square btn-ghost m-0 p-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
        <li className="list-row w-84 flex flex-col">
          <div className="flex w-full justify-between">
            <div className="text-lg">Meal 1</div>
            <span className="text-end min-w-18">14:32 pm</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-endtext-xs uppercase font-semibold opacity-60 text-xs">
              1231 calories
            </div>
            <div>
              <button className="btn btn-square btn-ghost m-0 p-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
        <li className="list-row w-84 flex flex-col">
          <div className="flex w-full justify-between">
            <div className="text-lg">Meal 1</div>
            <span className="text-end min-w-18">14:32 pm</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-endtext-xs uppercase font-semibold opacity-60 text-xs">
              1231 calories
            </div>
            <div>
              <button className="btn btn-square btn-ghost m-0 p-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
      </ul>
      <div className="sticky bottom-0 bg-base-100 z-10 py-4">
        <button className="btn w-84" onClick={() => openModal()}>
          Add Meal
        </button>
      </div>
    </div>
  );
}
