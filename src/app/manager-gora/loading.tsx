import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-gray-300 mb-4" />
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Loading data...</p>
    </div>
  );
}
