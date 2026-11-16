import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Devuelve la altura actual del teclado (0 cuando esta cerrado).
 * Se usa para dejar espacio abajo y que el teclado no tape los campos,
 * algo que en Android con pantalla completa (edge-to-edge) no pasa solo.
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) =>
      setHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}