import React from 'react';

export const useKeyboardHandlers = ({
  loading,
  onNext,
  onPrev,
  onSave,
  onToggleHasManu,
  onRemoveBoundingBox,
}: {
  loading: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  onToggleHasManu: (_event: Event, hasManu?: boolean) => void;
  onRemoveBoundingBox: (_event: Event) => void;
}) => {
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Prevent changes on loading
      if (loading) {
        return;
      }
      // console.log(event.key);
      switch (event.key) {
        case 'ArrowDown':
          // Mark "no manu" & go to next image
          onToggleHasManu(event, false);
          return onNext();
        case 'ArrowUp':
          // Mark "has manu" & go to next image
          onToggleHasManu(event, true);
          return onNext();
        // case 'Space':
        // case 'Enter':
        case 's':
          return onSave();
        case 'ArrowLeft':
          return onPrev();
        case 'ArrowRight':
          return onNext();
        case ' ':
          return onToggleHasManu(event);
        case 'Escape':
          return onRemoveBoundingBox(event);
        default:
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
};
