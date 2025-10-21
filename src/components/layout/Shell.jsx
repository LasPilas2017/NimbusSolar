import React from 'react';

export function Shell({ dimmed, children }) {
  return (
    <main
      className={[
        "relative flex-1 overflow-y-auto w-full",
        "pt-6 pl-16 pr-6",
        dimmed ? "blur-[1.5px] brightness-95" : "blur-0 brightness-100",
        "transition-all duration-700 ease-in-out"
      ].join(" ")}
    >
      {children}
    </main>
  );
}
