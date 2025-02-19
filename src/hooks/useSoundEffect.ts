// hooks/useSoundEffect.ts
import { useCallback } from 'react';
import { soundManager, SoundEffect } from '../utils/soundManager';

export type SoundAction = 
  | 'onSelect'     // For selecting an option
  | 'onConnect'    // For connecting items
  | 'onDrag'       // For dragging items
  | 'onDrop'       // For dropping items
  | 'onCorrect'    // For correct answers
  | 'onIncorrect'  // For incorrect answers
  | 'onComplete'   // For completing a question/lesson
  | 'onStreak'     // For maintaining a streak

export function useSoundEffect() {
  const playSoundForAction = useCallback((action: SoundAction) => {
    const soundMap: Record<SoundAction, SoundEffect> = {
      onSelect: 'click',
      onConnect: 'connected',
      onDrag: 'drag',
      onDrop: 'drop',
      onCorrect: 'correct',
      onIncorrect: 'incorrect',
      onComplete: 'achievement',
      onStreak: 'streak'
    };
    
    soundManager.play(soundMap[action]);
  }, []);

  return { playSoundForAction, getMuteState: soundManager.getMuteState.bind(soundManager) };
}