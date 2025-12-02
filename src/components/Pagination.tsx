import React from 'react';

export const Pagination = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
    if (total <= 1) return null;
    const pages = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
        pages.push(i);
    }
    return (
        <div className="flex justify-center gap-2 mt-8 pb-8">
            <button disabled={current === 1} onClick={() => onPageChange(current - 1)} className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700">&lt;</button>
            {current > 3 && <span className="text-gray-500 self-end">...</span>}
            {pages.map(p => (
                <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded font-bold ${current === p ? 'bg-fortnite-blue text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}>
                    {p}
                </button>
            ))}
            {current < total - 2 && <span className="text-gray-500 self-end">...</span>}
            <button disabled={current === total} onClick={() => onPageChange(current + 1)} className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700">&gt;</button>
        </div>
    );
};