'use client'
import React, { useState, useEffect } from 'react';
import type { SliderInputQuestion } from '@/types/question';
import RichContent from '../RichContent';
import { soundManager } from '@/utils/soundManager';
import { useTheme } from 'next-themes';

interface Props {
  question: SliderInputQuestion;
  onAnswer: (response: { correct: boolean; answer: string[] }) => void;
  onNext: () => void;
  userAnswer?: string;
}

function SunVisualization({ angle, height, shadowLength }: { angle: number; height: number; shadowLength: number }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use wider viewBox for better proportions
  const viewBoxWidth = 200;
  const viewBoxHeight = 100;
  const groundY = viewBoxHeight - 15;
  
  // Responsive scaling based on viewBox size
  const scale = 16; // viewBox units per meter
  const fontSize = viewBoxWidth * 0.03; // Responsive font size
  const sunSize = viewBoxWidth * 0.025; // Responsive sun size
  const rayLength = sunSize * 1.5; // Sun ray length relative to sun size
  const personWidth = viewBoxWidth * 0.004; // Responsive person width
  
  // Calculate sun position - use smaller radius for viewBox scale
  const radius = viewBoxWidth * 0.4;
  const sunX = shadowLength * scale + Math.cos((90 - angle) * Math.PI / 180) * radius;
  const sunY = groundY - (Math.sin((90 - angle) * Math.PI / 180) * radius);
  
  // Calculate person position
  const personX = shadowLength * scale;
  const personBaseY = groundY;
  const personHeight = height * scale;

  const isDark = mounted && resolvedTheme === 'dark';
  
  return (
    <div className="w-full max-w-full aspect-[2/1] max-h-[400px] mb-6 px-2">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full bg-background rounded-lg border border-border"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Ground */}
        <line 
          x1="0" 
          y1={groundY} 
          x2={viewBoxWidth} 
          y2={groundY} 
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={personWidth}
        />
        
        {/* Shadow */}
        <line 
          x1={shadowLength * scale} 
          y1={groundY} 
          x2="0" 
          y2={groundY} 
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={personWidth * 2}
          strokeDasharray="1 0.5"
        />
        
        {/* Person */}
        <g transform={`translate(${personX},${personBaseY})`}>
          {/* Body */}
          <line 
            x1="0" 
            y1="0" 
            x2="0" 
            y2={-personHeight} 
            stroke="hsl(var(--foreground))"
            strokeWidth={personWidth * 1.5}
          />
          {/* Head */}
          <circle 
            cx="0" 
            cy={-personHeight} 
            r={personWidth * 3}
            fill="hsl(var(--foreground))"
          />
        </g>
        
        {/* Sun */}
        <g transform={`translate(${sunX},${sunY})`}>
          <circle 
            r={sunSize}
            fill={isDark ? 'hsl(47.9 95.8% 53.1%)' : 'hsl(47.9 95.8% 53.1%)'} 
            stroke={isDark ? 'hsl(48 96.6% 88.8%)' : 'hsl(48 96.6% 88.8%)'} 
            strokeWidth={personWidth}
          />
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(rayAngle => (
            <line
              key={rayAngle}
              x1="0"
              y1="0"
              x2={Math.cos(rayAngle * Math.PI / 180) * rayLength}
              y2={Math.sin(rayAngle * Math.PI / 180) * rayLength}
              stroke="hsl(48 96.6% 58.8%)"
              strokeWidth={personWidth}
            />
          ))}
        </g>
        
        {/* Angle arc */}
        <path
          d={`M ${shadowLength * scale} ${groundY} 
             A 10 10 0 0 0 
             ${shadowLength * scale + Math.cos((90 - angle) * Math.PI / 180) * 10} 
             ${groundY - Math.sin((90 - angle) * Math.PI / 180) * 10}`}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={personWidth}
          className="select-none"
        />
        
        {/* Angle label */}
        <text
          x={shadowLength * scale + 5}
          y={groundY - 5}
          fill="hsl(var(--muted-foreground))"
          fontSize={fontSize}
          fontWeight="bold"
          className="select-none"
        >
          {angle}°
        </text>
        
        {/* Measurements */}
        <text 
          x="2" 
          y={groundY - fontSize} 
          fill="hsl(var(--muted-foreground))" 
          fontSize={fontSize} 
          fontWeight="bold" 
          className="select-none"
        >
          3m shadow
        </text>
        <text 
          x={shadowLength * scale + fontSize/2} 
          y={groundY - personHeight/2} 
          fill="hsl(var(--muted-foreground))" 
          fontSize={fontSize}
          fontWeight="bold" 
          className="select-none"
        >
          1.8m height
        </text>
      </svg>
    </div>
  );
}

export default function SliderInputQuestion({
  question,
  onAnswer,
  onNext,
  userAnswer,
}: Props) {
  const initialValue = userAnswer ? Number(userAnswer) : Math.floor((question.max + question.min) / 2);
  const [value, setValue] = useState<number>(initialValue);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    setValue(newValue);
    soundManager.play('click');
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    const isCorrect = Math.abs(value - question.correctAnswer) <= (question.tolerance || 1);
    onAnswer({ 
      correct: isCorrect,
      answer: [value.toString()]
    });
    soundManager.play(isCorrect ? 'correct' : 'incorrect');
    if (navigator.vibrate) navigator.vibrate(isCorrect ? 100 : [50, 50, 50]);
  };

  const isCorrect = hasSubmitted && Math.abs(value - question.correctAnswer) <= (question.tolerance || 1);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <RichContent content={question.question} />
      </div>
      
      {question.scenario && (
        <div className="mb-4 p-3 bg-muted rounded-lg text-muted-foreground">
          {question.scenario}
        </div>
      )}
      
      <SunVisualization angle={value} height={1.8} shadowLength={3} />

      <div className="flex flex-col items-center space-y-4">
        <div className="w-full flex items-center space-x-4">
          <span className="text-sm text-foreground">{question.min}{question.unit}</span>
          <input
            type="range"
            min={question.min}
            max={question.max}
            value={value}
            onChange={handleChange}
            disabled={hasSubmitted}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <span className="text-sm text-foreground">{question.max}{question.unit}</span>
        </div>

        <div className="text-lg font-semibold mb-4 text-foreground">
          Selected value: {value}{question.unit}
        </div>

        {!hasSubmitted && (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 active:scale-95 transition-all"
          >
            Check Answer
          </button>
        )}

        {hasSubmitted && (
          <>
            <div className={`mt-4 p-3 rounded-lg ${
              isCorrect 
                ? 'bg-success-muted text-success-emphasis' 
                : 'bg-error-muted text-error-emphasis'
            }`}>
              {isCorrect ? 'Correct!' : `The correct answer was ${question.correctAnswer}${question.unit}`}
              {question.explanation && (
                <div className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground/90">
                  {question.explanation}
                </div>
              )}
            </div>
            <button
              onClick={onNext}
              className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 active:scale-95 transition-all"
            >
              Next Question
            </button>
          </>
        )}
      </div>
    </div>
  );
}
