"use client";

import { useRef, useState, ClipboardEvent, KeyboardEvent } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OtpInput({ length = 6, value, onChange, disabled = false }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  // Toujours un tableau de exactement `length` éléments
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const arr = Array.from({ length }, (_, i) => value[i] ?? "");
    arr[index] = digit;
    onChange(arr.join("").trimEnd());
    if (digit && index < length - 1) focus(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[index]) {
        const arr = Array.from({ length }, (_, i) => value[i] ?? "");
        arr[index] = "";
        onChange(arr.join("").trimEnd());
      } else if (index > 0) {
        focus(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focus(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focus(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, length - 1);
    focus(nextIndex);
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-lg border-2 outline-none transition-colors
            ${digits[i] ? "border-toni-green-dark text-toni-green-dark bg-toni-green-light/30" : "border-gray-300 text-gray-800 bg-white"}
            focus:border-toni-green-dark
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
      ))}
    </div>
  );
}
