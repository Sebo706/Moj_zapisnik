const paths={
 mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
 camera:'<path d="M14.5 4h-5L7 7H3a1 1 0 0 0-1 1v12h20V8a1 1 0 0 0-1-1h-4z"/><circle cx="12" cy="13" r="4"/>',
 pen:'<path d="m16 3 5 5-12 12-6 1 1-6zM13 6l5 5"/>',
 bulb:'<path d="M9 18h6M9 21h6M9 15c0-2-4-3-4-7a7 7 0 0 1 14 0c0 4-4 5-4 7z"/>',
 home:'<path d="m3 10 9-8 9 8v11h-6v-7H9v7H3z"/>',
 plus:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
 records:'<rect x="5" y="3" width="14" height="19" rx="2"/><path d="M9 2h6v4H9zM8 11h8M8 15h8M8 18h5"/>'
};
export const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.records}</svg>`;
