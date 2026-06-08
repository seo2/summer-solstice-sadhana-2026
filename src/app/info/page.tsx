import infoPages from "@/data/info-pages.json";
import type { InfoPage } from "@/lib/types";

export default function InfoPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-800">Offline info</p>
        <h1 className="text-3xl font-black text-stone-950">Info</h1>
        <p className="mt-2 text-sm leading-6 text-stone-700">Selected pages extracted from the PDF. Keep a manual content review pass before publishing.</p>
      </div>
      <div className="space-y-3">
        {(infoPages as InfoPage[]).map((page) => (
          <details key={page.id} className="card rounded-3xl p-4">
            <summary className="cursor-pointer text-lg font-bold text-stone-950">{page.title}</summary>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">PDF page {page.sourcePage}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">{page.content}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
