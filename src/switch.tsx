import React from 'react';

type SwitchProps = {
  mode: string;
  state: string;
  checked: boolean;
  onToggle: (mode: string) => void;
};

function Switch({ mode, state, checked, onToggle }: SwitchProps) {
  return (
    <div>
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(mode)}
        />
        <span className={`slider ${mode}`} />
      </label>
      <span className="mode">{mode}</span>
    </div>
  );
}

export default Switch;