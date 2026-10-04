import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useTechnicianStore } from '../store/useTechnicianStore';

interface VoiceNoteButtonProps {
  onTranscript: (text: string) => void;
}

export const VoiceNoteButton: React.FC<VoiceNoteButtonProps> = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { greasyHandsMode } = useTechnicianStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const sr = new SpeechRecognition();
        sr.continuous = true;
        sr.interimResults = true;
        
        sr.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (currentTranscript.trim()) {
            onTranscript(currentTranscript.trim());
          }
        };

        sr.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };

        sr.onend = () => {
          setIsRecording(false);
        };

        setRecognition(sr);
      }
    }
  }, [onTranscript]);

  const toggleRecording = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    }
  }, [isRecording, recognition]);

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`flex items-center justify-center transition-all rounded-xl border ${
        isRecording 
          ? 'bg-red-500/20 border-red-500/50 text-red-500 animate-pulse' 
          : 'bg-[var(--bg-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
      } ${greasyHandsMode ? 'p-6 w-full text-2xl gap-4 mb-4' : 'p-3 w-12 h-12'}`}
      title="Voice to Text"
    >
      {isRecording ? (
        <>
          <MicOff size={greasyHandsMode ? 32 : 20} />
          {greasyHandsMode && <span>Stop Recording...</span>}
        </>
      ) : (
        <>
          <Mic size={greasyHandsMode ? 32 : 20} />
          {greasyHandsMode && <span>Dictate Notes 🎙️</span>}
        </>
      )}
    </button>
  );
};


