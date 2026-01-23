import React from 'react';

interface AppleTrackerProps {
    targetSyllables: string[];
    collectedSyllables: string[];
}

export const AppleTracker: React.FC<AppleTrackerProps> = ({ targetSyllables, collectedSyllables }) => {
    return (
        <div className="px-4 pb-3 flex items-center justify-center">
            <div className="syllable-tracker bg-white/90 rounded-[14px] px-3.5 py-2 flex items-center gap-2 shadow-sm">
                <span className="font-bold text-[12px] text-[#666]">글자 모으기:</span>
                <div className="flex gap-1">
                    {targetSyllables.map((s, i) => {
                        const syllableIndex = targetSyllables.slice(0, i + 1).filter(ts => ts === s).length;
                        const collectedCount = collectedSyllables.filter(cs => cs === s).length;
                        const isRevealed = collectedCount >= syllableIndex;

                        return (
                            <div
                                key={i}
                                className={`w-[26px] h-[30px] rounded-[6px] flex items-center justify-center transition-all ${isRevealed ? 'bg-[#4a90e2] text-white' : 'bg-[#e5e5e5]'
                                    }`}
                            >
                                {isRevealed && <span className="font-bold text-[14px]">{s}</span>}
                            </div>
                        );
                    })}
                </div>
                <span className="text-[11px] text-[#999]">
                    ({collectedSyllables.length}/{targetSyllables.length})
                </span>
            </div>
        </div>
    );
};
