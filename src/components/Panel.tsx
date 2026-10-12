import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  children: ReactNode;
};

export default function Panel({ title, children }: PanelProps) {
  return (
    <section className="flex flex-col gap-[22px] rounded-lg border border-line bg-panel px-[26px] pt-6 pb-[26px]">
      <h2 className="border-b border-line pb-1.5 font-label text-xs/[normal] tracking-[0.18em] text-amber uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
