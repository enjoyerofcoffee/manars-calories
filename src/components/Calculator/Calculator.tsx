// Calculator.tsx
import React, { useState } from "react";

type Operator = "+" | "-" | "*" | "/";

const operations: Record<Operator, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState<string>("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);

  const inputDigit = (digit: string) => {
    setDisplay((prev) => {
      if (waitingForSecond) {
        setWaitingForSecond(false);
        return digit;
      }
      return prev === "0" ? digit : prev + digit;
    });
  };

  const inputDecimal = () => {
    setDisplay((prev) => {
      if (waitingForSecond) {
        setWaitingForSecond(false);
        return "0.";
      }
      return prev.includes(".") ? prev : prev + ".";
    });
  };

  const handleOperator = (nextOp: Operator) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = operations[operator](firstOperand, inputValue);
      setFirstOperand(result);
      setDisplay(String(result));
    }

    setWaitingForSecond(true);
    setOperator(nextOp);
  };

  const clearAll = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
  };

  const handleEqual = () => {
    if (!operator || firstOperand === null) return;
    const inputValue = parseFloat(display);
    const result = operations[operator](firstOperand, inputValue);
    setDisplay(String(result));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
  };

  //
  // Tailwind class variables
  //
  const numberButton =
    "flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition text-slate-900 text-lg py-2";

  const operatorButton =
    "flex btn btn-primary items-center justify-center rounded-md hover:bg-base-200 active:bg-base-100 transition text-white text-lg py-2";

  const clearButton =
    "col-span-4 flex items-center justify-center rounded-md bg-red-500 hover:bg-red-600 active:bg-red-700 transition text-white text-lg py-2";

  return (
    <div className="rounded-xl bg-base-100 p-4 shadow-sm">
      {/* Left: Display */}
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-end rounded-md bg-slate-900 px-3 text-right text-2xl font-mono text-base-300 mb-2">
          {display}
        </div>
      </div>
      <div className="flex gap-4 items-stretch">
        {/* Right: Buttons grid */}
        <div className="flex-[2] grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("7")}
          >
            7
          </button>
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("8")}
          >
            8
          </button>
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("9")}
          >
            9
          </button>
          <button
            type="button"
            className={operatorButton}
            onClick={() => handleOperator("/")}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("4")}
          >
            4
          </button>
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("5")}
          >
            5
          </button>
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("6")}
          >
            6
          </button>
          <button
            type="button"
            className={operatorButton}
            onClick={() => handleOperator("*")}
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("1")}
          >
            1
          </button>
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("2")}
          >
            2
          </button>
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("3")}
          >
            3
          </button>
          <button
            type="button"
            className={operatorButton}
            onClick={() => handleOperator("-")}
          >
            −
          </button>

          {/* Row 4 */}
          <button
            type="button"
            className={numberButton}
            onClick={() => inputDigit("0")}
          >
            0
          </button>
          <button type="button" className={numberButton} onClick={inputDecimal}>
            .
          </button>
          <button
            type="button"
            className={operatorButton}
            onClick={handleEqual}
          >
            =
          </button>
          <button
            type="button"
            className={operatorButton}
            onClick={() => handleOperator("+")}
          >
            +
          </button>

          {/* Clear */}
          <button type="button" className={clearButton} onClick={clearAll}>
            C
          </button>
        </div>
      </div>
    </div>
  );
};
