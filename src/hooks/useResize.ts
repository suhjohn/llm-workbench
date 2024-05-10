import { useEffect, useRef, useState } from "react";

export const useHorizontalResize = ({
  initialWidth = 0,
  onResize,
}: {
  initialWidth?: number;
  onResize?: (width: number) => void;
}) => {
  const [width, setWidth] = useState<number>(initialWidth);
  const isResized = useRef(false);
  useEffect(() => {
    window.addEventListener("mousemove", (e) => {
      if (!isResized.current) {
        return;
      }
      const env = process.env.NODE_ENV;
      const nextWidth =
        env === "development"
          ? (prevWidth: number) => {
              const newWidth = prevWidth - e.movementX;
              onResize?.(newWidth);
              return newWidth;
            }
          : (prevWidth: number) => {
              // * 2 is because the boxes are under flex and with flex-shrink you need this hack
              const newWidth = prevWidth - e.movementX * 2;
              onResize?.(newWidth);
              return newWidth;
            };
      setWidth(nextWidth);
    });
    window.addEventListener("mouseup", () => {
      isResized.current = false;
    });
  }, []);
  
  return {
    width,
    setWidth,
    isResized,
  };
};
