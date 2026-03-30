"use client";

import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export function OtpInput({ length = 6, onComplete, disabled = false }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("").concat(Array(length - pastedData.length).fill(""));
    setOtp(newOtp);

    if (pastedData.length === length) {
      onComplete(pastedData);
      inputs.current[length - 1]?.focus();
    } else if (pastedData.length > 0) {
      inputs.current[pastedData.length]?.focus();
    }
  };

  // Auto-focus first input on mount
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-bold"
          autoComplete="off"
        />
      ))}
    </div>
  );
}
