import infoPages from "@/data/info-pages.json";
import type { InfoPage } from "@/lib/types";

export default function InfoPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="solstice-kicker text-sm font-bold uppercase">Offline info</p>
        <h1 className="text-3xl font-black text-[#2f62b6]">Info</h1>
        <p className="mt-2 text-sm leading-6 text-slate-700">Selected pages extracted from the PDF. The Code of Conduct has been transcribed from pages 18–20 for offline access.</p>
      </div>
      <div className="space-y-3">
        {(infoPages as InfoPage[]).map((page) => (
          <details key={page.id} className="card rounded-3xl p-4">
            <summary className="cursor-pointer text-lg font-bold text-slate-950">{page.title}</summary>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PDF page {page.sourcePage}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{page.content}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
