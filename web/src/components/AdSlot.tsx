import { siteConfig } from '@/lib/site-config';

type AdSlotProps = {
  label: string;
  heightClassName?: string;
};

export function AdSlot({ label, heightClassName = 'min-h-[90px]' }: AdSlotProps) {
  if (siteConfig.hasAdsense) {
    return null;
  }

  return (
    <div
      className={`w-full ${heightClassName} bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-medium`}
    >
      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">
        Advertisement
      </span>
      <span className="text-slate-300 text-[10px]">{label}</span>
    </div>
  );
}
