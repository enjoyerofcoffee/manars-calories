type CalculatorButtonProps = {
  onClick: () => void;
};
export const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  onClick,
}) => {
  return (
    <div className="space-x-2">
      <button type="button" className="btn btn-square" onClick={onClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 64 64"
          fill="none"
        >
          <rect
            x="10"
            y="6"
            width="44"
            height="52"
            rx="6"
            ry="6"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />

          <rect
            x="16"
            y="10"
            width="32"
            height="12"
            rx="2"
            ry="2"
            fill="currentColor"
            opacity="0.15"
          />

          <line
            x1="16"
            y1="26"
            x2="48"
            y2="26"
            stroke="currentColor"
            stroke-width="1.5"
            opacity="0.5"
          />

          <circle cx="18" cy="34" r="2" fill="currentColor" />
          <circle cx="26" cy="34" r="2" fill="currentColor" />
          <circle cx="34" cy="34" r="2" fill="currentColor" />
          <circle cx="42" cy="34" r="2" fill="currentColor" />

          <circle cx="18" cy="42" r="2" fill="currentColor" />
          <circle cx="26" cy="42" r="2" fill="currentColor" />
          <circle cx="34" cy="42" r="2" fill="currentColor" />
          <circle cx="42" cy="42" r="2" fill="currentColor" />

          <circle cx="18" cy="50" r="2" fill="currentColor" />
          <circle cx="26" cy="50" r="2" fill="currentColor" />
          <circle cx="34" cy="50" r="2" fill="currentColor" />
          <circle cx="42" cy="50" r="2" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};
