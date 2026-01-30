import type { ChangeEvent } from "react";
import type { DictationFieldState } from "../lib/dictation/useDictationManager";

type DictationControls = {
  supported: boolean;
  isActive: boolean;
  state: DictationFieldState;
  onToggle: () => void;
  onConfirm: () => void;
};

type DictatedFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "textarea";
  rows?: number;
  helperText?: string;
  describedById?: string;
  dictation?: DictationControls;
  showUnsupportedNote?: boolean;
};

const DictationIcon = ({ active }: { active: boolean }) => (
  <span className="icon" aria-hidden="true">
    {active ? (
      <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
        <rect x="4" y="4" width="8" height="8" rx="1" />
      </svg>
    ) : (
      <svg viewBox="0 0 16 16" width="16" height="16" role="presentation">
        <path d="M8 2a2 2 0 0 0-2 2v4a2 2 0 1 0 4 0V4a2 2 0 0 0-2-2z" />
        <path d="M3.5 7.5a.75.75 0 1 0-1.5 0 6 6 0 0 0 5.25 5.96V15H6a.75.75 0 1 0 0 1.5h4a.75.75 0 1 0 0-1.5H8.75v-1.54A6 6 0 0 0 14 7.5a.75.75 0 1 0-1.5 0A4.5 4.5 0 0 1 8 12a4.5 4.5 0 0 1-4.5-4.5z" />
      </svg>
    )}
  </span>
);

export const DictatedField = ({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  rows,
  helperText,
  describedById,
  dictation,
  showUnsupportedNote
}: DictatedFieldProps) => {
  const showDictation = !!dictation;
  const isTextarea = type === "textarea";

  return (
    <div className="form-field">
      <div className="dictation-row">
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
        {showDictation && dictation?.supported ? (
          <button
            className="button secondary small"
            type="button"
            onClick={dictation.onToggle}
            aria-label={
              dictation.isActive ? `Stop dictation for ${label}` : `Start dictation for ${label}`
            }
          >
            <DictationIcon active={dictation.isActive} />
            <span>{dictation.isActive ? "Stop" : "Dictate"}</span>
          </button>
        ) : null}
      </div>

      {isTextarea ? (
        <textarea
          className="form-textarea"
          id={id}
          name={name}
          rows={rows ?? 4}
          value={value}
          onChange={onChange}
          aria-describedby={describedById}
        />
      ) : (
        <input
          className="form-input"
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          aria-describedby={describedById}
        />
      )}

      {helperText ? (
        <div className="form-helper" id={describedById}>
          {helperText}
        </div>
      ) : null}

      {showDictation && dictation?.supported ? (
        <div className="dictation-meta">
          <span className={`dictation-pill ${dictation.isActive ? "active" : ""}`}>
            {dictation.isActive ? "Listening..." : "Dictation idle"}
          </span>
          <button
            className="button ghost small"
            type="button"
            onClick={dictation.onConfirm}
            disabled={!dictation.state.raw && !value}
          >
            Confirm dictated text
          </button>
          {dictation.state.requiresReview ? (
            <span className="form-helper">Review required before final submission.</span>
          ) : null}
        </div>
      ) : showUnsupportedNote ? (
        <p className="form-helper">Dictation not supported on this device.</p>
      ) : null}
    </div>
  );
};
