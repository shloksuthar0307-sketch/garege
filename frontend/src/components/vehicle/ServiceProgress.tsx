import { useGarageStore, type ServiceStage } from '../../hooks/useGarageStore';

const STAGES: { id: ServiceStage; label: string }[] = [
  { id: 'INSPECTION', label: 'INSPECTION' },
  { id: 'ESTIMATE', label: 'ESTIMATE' },
  { id: 'APPROVED', label: 'APPROVED' },
  { id: 'REPAIRING', label: 'REPAIRING' },
  { id: 'QUALITY CHECK', label: 'QUALITY CHECK' },
  { id: 'COMPLETED', label: 'COMPLETED' }
];

export function ServiceProgress() {
  const currentStage = useGarageStore((state) => state.serviceStage);
  
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-40">
      <div className="relative">
        {/* Background Track */}
        <div className="absolute top-3 left-0 w-full h-px bg-white/10" />
        
        {/* Active Track */}
        <div 
          className="absolute top-3 left-0 h-px bg-[#35D07F] transition-all duration-700 ease-out"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        />

        {/* Stages */}
        <div className="relative flex justify-between">
          {STAGES.map((stage, i) => {
            const isCompleted = i < currentIndex;
            const isActive = i === currentIndex;
            const isPending = i > currentIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center gap-3">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 bg-[#020202] ${
                    isCompleted 
                      ? 'border-[#35D07F] text-[#35D07F] border-2 shadow-[0_0_10px_rgba(53,208,127,0.3)]' 
                      : isActive 
                        ? 'border-white text-white border-2 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                        : 'border-white/20 text-white/30 border'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isCompleted ? 'bg-[#35D07F]' : isActive ? 'bg-white' : 'bg-transparent'
                  }`} />
                </div>
                <span className={`text-[9px] font-sans tracking-[0.2em] uppercase transition-colors duration-500 whitespace-nowrap ${
                  isCompleted ? 'text-[#35D07F]' : isActive ? 'text-white' : 'text-white/30'
                }`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

