import React from 'react';

export const Badge = ({ color, text }: { color: string, text: string }) => (
  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${color}`}>
    {text}
  </span>
);