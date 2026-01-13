import React from "react";

type VoiceSelectProps = {
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
};

export default function VoiceSelect({ selectedVoice, setSelectedVoice }: VoiceSelectProps) {
  return (
    <select
      id="voiceSelect"
      className="p-2 border rounded-lg input-dark bg-background text-foreground border-input focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
      value={selectedVoice}
      onChange={e => setSelectedVoice(e.target.value)}
    >
      <option value="am-ET-AmehaNeural">የወንድ</option>
      <option value="am-ET-MekdesNeural">የሴት</option>
    </select>
  );
} 