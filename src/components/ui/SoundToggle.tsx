// components/ui/SoundToggle.tsx
import React, { useState, useEffect } from 'react';
import { VolumeX, Volume2 } from 'lucide-react'; // Assuming you're using Lucide icons
import { soundManager } from '../../utils/soundManager';

export const SoundToggle: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    // Get initial state from sound manager
    setIsMuted(soundManager.getMuteState());
    
    // Setup listener for storage changes to keep UI in sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'soundMuted') {
        setIsMuted(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleSound = () => {
    soundManager.toggleMute();
    setIsMuted(soundManager.getMuteState());
    
    // Play a test sound if enabled
    if (!soundManager.getMuteState()) {
      soundManager.play('click');
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={isMuted ? 'Enable sounds' : 'Mute sounds'}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
};