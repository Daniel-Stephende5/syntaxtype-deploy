import { useEffect, useRef, useState } from "react";

/**
 * useControls
 * - Manages movement key state, typing buffer, pause/restart helpers.
 * - Exposes refs so Game.js can keep using refs for performance.
 */
export function useControls({ onTyped = null, onBackspace = null } = {}) {
  const keysPressed = useRef({});
  const typedLetters = useRef("");
  const currentPowerup = useRef(null); // optional, Game can use
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused) return;
      const key = e.key;

      // Movement (store raw key names for compatibility)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        e.preventDefault();
        keysPressed.current[key] = true;
        return;
      }

      // Backspace (Shift+Backspace clears whole buffer)
      if (key === "Backspace") {
        e.preventDefault();
        if (e.shiftKey) {
          // clear full buffer when Shift is held
          typedLetters.current = "";
          onBackspace && onBackspace(typedLetters.current);
        } else {
          typedLetters.current = typedLetters.current.slice(0, -1);
          onBackspace && onBackspace(typedLetters.current);
        }
        return;
      }

      // Single character typing (letters/numbers/punctuation)
      if (key.length === 1) {
        typedLetters.current += key;
       onTyped && onTyped(key);
      }
    };

    const handleKeyUp = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        keysPressed.current[e.key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPaused, onTyped, onBackspace]);

  const togglePause = () => setIsPaused((p) => !p);
  const clearTyped = () => {
    typedLetters.current = "";
  };
  const restart = (resetCallback) => {
    clearTyped();
    keysPressed.current = {};
    setIsPaused(false);
    if (typeof resetCallback === "function") resetCallback();
  };

  return {
    keysPressed,
    typedLetters,
    currentPowerup,
    isPaused,
    togglePause,
    clearTyped,
    restart,
  };
}
