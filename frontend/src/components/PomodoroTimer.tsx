import { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '../types';
import { taskService } from '../services/taskService';

interface PomodoroTimerProps {
  task: Task;
  onTimeUpdate: (taskId: string, timeSpent: number) => void;
  onComplete?: () => void;
}

interface TimerState {
  mode: 'work' | 'short_break' | 'long_break';
  timeLeft: number; // in seconds
  isRunning: boolean;
  pomodoroCount: number;
  totalTimeSpent: number; // in minutes
}

const TIMER_MODES = {
  work: { duration: 25 * 60, label: 'Work', color: 'bg-red-500', emoji: '🍅' },
  short_break: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500', emoji: '☕' },
  long_break: { duration: 15 * 60, label: 'Long Break', color: 'bg-blue-500', emoji: '🏖️' },
};

export function PomodoroTimer({ task, onTimeUpdate, onComplete }: PomodoroTimerProps) {
  const [timer, setTimer] = useState<TimerState>({
    mode: 'work',
    timeLeft: TIMER_MODES.work.duration,
    isRunning: false,
    pomodoroCount: 0,
    totalTimeSpent: 0,
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (timer.isRunning && timer.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, timer.timeLeft]);

  // Handle timer completion
  useEffect(() => {
    if (timer.isRunning && timer.timeLeft === 0) {
      handleTimerComplete();
    }
  }, [timer.timeLeft, timer.isRunning, handleTimerComplete]);

  const playNotificationSound = useCallback(() => {
    if (audioEnabled && audioRef.current) {
      // Create a simple beep sound using Web Audio API
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, [audioEnabled]);

  const handleTimerComplete = useCallback(async () => {
    playNotificationSound();
    
    // Log work time
    if (timer.mode === 'work') {
      const timeSpent = TIMER_MODES.work.duration / 60; // Convert to minutes
      setTimer(prev => ({ ...prev, totalTimeSpent: prev.totalTimeSpent + timeSpent }));
      
      // Update task actual_hours
      try {
        const currentActualHours = task.actual_hours || 0;
        const newActualHours = currentActualHours + (timeSpent / 60); // Convert to hours
        await taskService.updateTask(task.id, { actual_hours: newActualHours });
        onTimeUpdate(task.id, timeSpent / 60);
      } catch (error) {
        console.error('Error updating task time:', error);
      }
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const mode = TIMER_MODES[timer.mode];
      new Notification(`${mode.emoji} ${mode.label} Complete!`, {
        body: timer.mode === 'work' 
          ? `Great work on "${task.name}"! Time for a break.`
          : 'Break time is over. Ready to get back to work?',
        icon: '/vite.svg',
      });
    }

    // Auto-advance to next mode
    if (timer.mode === 'work') {
      const newPomodoroCount = timer.pomodoroCount + 1;
      const nextMode = newPomodoroCount % 4 === 0 ? 'long_break' : 'short_break';
      setTimer(prev => ({
        ...prev,
        mode: nextMode,
        timeLeft: TIMER_MODES[nextMode].duration,
        isRunning: false,
        pomodoroCount: newPomodoroCount,
      }));
    } else {
      setTimer(prev => ({
        ...prev,
        mode: 'work',
        timeLeft: TIMER_MODES.work.duration,
        isRunning: false,
      }));
    }

    onComplete?.();
  }, [timer.mode, timer.pomodoroCount, task, onTimeUpdate, onComplete, playNotificationSound]);

  const startTimer = () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    startTimeRef.current = new Date();
    setTimer(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setTimer(prev => ({
      ...prev,
      timeLeft: TIMER_MODES[prev.mode].duration,
      isRunning: false,
    }));
  };

  const switchMode = (mode: 'work' | 'short_break' | 'long_break') => {
    setTimer(prev => ({
      ...prev,
      mode,
      timeLeft: TIMER_MODES[mode].duration,
      isRunning: false,
    }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentMode = TIMER_MODES[timer.mode];
  const progress = ((currentMode.duration - timer.timeLeft) / currentMode.duration) * 100;

  if (!isExpanded) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            timer.isRunning 
              ? `${currentMode.color} text-white` 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span>{currentMode.emoji}</span>
          <span>{formatTime(timer.timeLeft)}</span>
          {timer.isRunning && <div className="w-1 h-1 bg-white rounded-full animate-pulse" />}
        </button>
        
        {!timer.isRunning ? (
          <button
            onClick={startTimer}
            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
            title="Start timer"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
            title="Pause timer"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentMode.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{currentMode.label}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pomodoro #{timer.pomodoroCount + 1}</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200 dark:text-gray-700"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={currentMode.color.replace('bg-', 'text-')}
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${progress}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
              {formatTime(timer.timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {!timer.isRunning ? (
          <button
            onClick={startTimer}
            className={`px-4 py-2 ${currentMode.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            Pause
          </button>
        )}
        
        <button
          onClick={resetTimer}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5c0 4.97-4.03 9-9 9s-9-4.03-9-9z" />
          </svg>
          Reset
        </button>
      </div>

      {/* Mode Switches */}
      <div className="flex gap-1 mb-4">
        {(Object.keys(TIMER_MODES) as Array<keyof typeof TIMER_MODES>).map((mode) => {
          const modeConfig = TIMER_MODES[mode];
          return (
            <button
              key={mode}
              onClick={() => switchMode(mode)}
              className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                timer.mode === mode
                  ? `${modeConfig.color} text-white`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {modeConfig.emoji} {modeConfig.label}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-center text-sm border-t border-gray-200 dark:border-gray-600 pt-3">
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{timer.pomodoroCount}</div>
          <div className="text-gray-500 dark:text-gray-400">Completed</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{timer.totalTimeSpent.toFixed(1)}m</div>
          <div className="text-gray-500 dark:text-gray-400">Today</div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={audioEnabled}
            onChange={(e) => setAudioEnabled(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Sound alerts
        </label>
      </div>
    </div>
  );
}