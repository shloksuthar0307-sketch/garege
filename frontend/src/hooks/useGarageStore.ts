import { create } from 'zustand';
import * as THREE from 'three';

export type CameraPreset = 'Overview' | 'Front' | 'Rear' | 'Driver Side' | 'Passenger Side' | 'Engine' | 'Brake' | 'Interior' | 'Wall Art' | 'Tool Wall' | 'Tire Station';
export type ServiceStage = 'INSPECTION' | 'ESTIMATE' | 'APPROVED' | 'REPAIRING' | 'QUALITY CHECK' | 'COMPLETED';
export type DiagnosticStatus = 'critical' | 'warning' | 'good';

export interface DiagnosticData {
  id: string;
  label: string;
  status: DiagnosticStatus;
  issue: string;
  recommendation: string;
  cost: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  cameraTarget: CameraPreset;
}

export interface ChatMessage {
  id: string;
  sender: 'Advisor' | 'Customer';
  text: string;
  timestamp: string;
}

export const CAMERA_POSITIONS: Record<CameraPreset, { position: [number, number, number], target: [number, number, number] }> = {
  'Overview': { position: [0, 3, 35], target: [0, 2, 0] },
  'Front': { position: [0, 1.5, 6], target: [0, 1, 0] },
  'Rear': { position: [0, 1.5, -6], target: [0, 1, 0] },
  'Driver Side': { position: [-5, 1.5, 0], target: [0, 1, 0] },
  'Passenger Side': { position: [5, 1.5, 0], target: [0, 1, 0] },
  'Engine': { position: [0, 2.5, 3], target: [0, 0.5, 1.5] },
  'Brake': { position: [-2, 0.5, 2], target: [-1, 0.3, 1.5] },
  'Interior': { position: [0.3, 0.4, -0.2], target: [0.3, 0.2, 2] },
  'Wall Art': { position: [-8, 4.5, 4], target: [-14.9, 4.5, 4] },
  'Tool Wall': { position: [-8, 2, -4], target: [-14.9, 2, -4] },
  'Tire Station': { position: [7, 2, -2], target: [14, 2, -2] },
};

export const DIAGNOSTICS_DATA: Record<string, DiagnosticData> = {
  'brakes': {
    id: 'brakes',
    label: 'FRONT BRAKES',
    status: 'critical',
    issue: 'Brake pads at approximately 2mm thickness.',
    recommendation: 'Replace brake pads and resurface rotors.',
    cost: 850,
    urgency: 'HIGH',
    cameraTarget: 'Brake',
  },
  'engine': {
    id: 'engine',
    label: 'ENGINE',
    status: 'warning',
    issue: 'Engine oil level below recommended range.',
    recommendation: 'Inspect for leakage and perform oil service.',
    cost: 150,
    urgency: 'MEDIUM',
    cameraTarget: 'Engine',
  },
  'tires': {
    id: 'tires',
    label: 'REAR TIRES',
    status: 'warning',
    issue: 'Rear tires showing uneven tread wear.',
    recommendation: 'Inspect alignment and rotate/replace tires if required.',
    cost: 600,
    urgency: 'MEDIUM',
    cameraTarget: 'Rear',
  }
};

interface GarageState {
  liftHeight: number;
  cameraPreset: CameraPreset;
  diagnosticsMode: boolean;
  
  // UI States
  isReportOpen: boolean;
  isConnectOpen: boolean;
  activeDiagnosticId: string | null;
  serviceStage: ServiceStage;
  chatMessages: ChatMessage[];
  explodeValue: number;

  // Actions
  setLiftHeight: (height: number) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleDiagnosticsMode: () => void;
  setDiagnosticsMode: (mode: boolean) => void;
  setReportOpen: (open: boolean) => void;
  setConnectOpen: (open: boolean) => void;
  setActiveDiagnostic: (id: string | null) => void;
  setServiceStage: (stage: ServiceStage) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setExplodeValue: (value: number) => void;
}

export const useGarageStore = create<GarageState>((set) => ({
  liftHeight: 0,
  cameraPreset: 'Overview',
  diagnosticsMode: false,
  explodeValue: 0,
  
  isReportOpen: false,
  isConnectOpen: false,
  activeDiagnosticId: null,
  serviceStage: 'ESTIMATE',
  chatMessages: [
    {
      id: '1',
      sender: 'Advisor',
      text: "Hi! We've completed the inspection. The front brake pads are showing significant wear.",
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],

  setLiftHeight: (height) => set({ liftHeight: height }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  toggleDiagnosticsMode: () => set((state) => ({ diagnosticsMode: !state.diagnosticsMode })),
  setDiagnosticsMode: (mode) => set({ diagnosticsMode: mode }),
  
  setReportOpen: (open) => set({ isReportOpen: open }),
  setConnectOpen: (open) => set({ isConnectOpen: open }),
  setActiveDiagnostic: (id) => set({ activeDiagnosticId: id }),
  setServiceStage: (stage) => set({ serviceStage: stage }),
  addChatMessage: (msg) => set((state) => ({
    chatMessages: [
      ...state.chatMessages,
      {
        ...msg,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  })),
  setExplodeValue: (value) => set({ explodeValue: value }),
}));

