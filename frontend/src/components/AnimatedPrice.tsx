import { useEffect, useRef, useState } from "react";

interface AnimatedPriceProps {
  value: number | null;
  format: (n: number | null) => string;
  className?: string;
}

export default function AnimatedPrice({
  value,
  format,
  className = "",
}: AnimatedPriceProps) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value == null || prevRef.current == null) {
      prevRef.current = value;
      return;
    }

    if (value > prevRef.current) {
      setFlash("up");
    } else if (value < prevRef.current) {
      setFlash("down");
    }

    prevRef.current = value;
    const id = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(id);
  }, [value]);

  const flashClass =
    flash === "up"
      ? "price-flash-up"
      : flash === "down"
        ? "price-flash-down"
        : "";

  return (
    <span className={`${flashClass} rounded px-1 -mx-1 font-mono ${className}`}>
      {format(value)}
    </span>
  );
}
