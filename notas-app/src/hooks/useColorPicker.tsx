// useColorPicker.ts
import { useState, useRef, useCallback } from "react";

export function useColorPicker(initialColor: string = "#000000") {
  const [color, setColor] = useState(initialColor);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback((left: number, top: number) => {
    if (!inputRef.current) return;
    console.log(left, top)
    inputRef.current.style.left = `${left}px`;
    inputRef.current.style.top = `${top}px`;

    requestAnimationFrame(() => {
      inputRef.current?.click();
    })
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  }, []);

  // JSX do input hidden que você coloca em algum lugar do componente
  const ColorPickerInput = (
    <input
      ref={inputRef}
      type="color"
      value={color}
      onChange={handleChange}
      style={{ display: "flex", visibility: "hidden", position: "absolute" }}
    />
  );

  return { color, setColor, openPicker, ColorPickerInput };
}