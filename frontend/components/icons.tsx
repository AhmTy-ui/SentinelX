import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const Logo = (props: P) => (
  <svg {...base(props)} fill="none">
    <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />
    <path d="M12 7v5l3 2" stroke="currentColor" />
  </svg>
);
export const Shield = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />
  </svg>
);
export const Grid = (props: P) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
export const Wallet = (props: P) => (
  <svg {...base(props)}>
    <path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v1H5a2 2 0 00-2 2z" />
    <path d="M3 8v8a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2" />
    <circle cx="16.5" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
export const Activity = (props: P) => (
  <svg {...base(props)}>
    <path d="M3 12h4l2 6 4-14 2 8h6" />
  </svg>
);
export const FileCode = (props: P) => (
  <svg {...base(props)}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M10 12l-2 2 2 2M14 12l2 2-2 2" />
  </svg>
);
export const Radar = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 12l6-4" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);
export const Bell = (props: P) => (
  <svg {...base(props)}>
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 01-3.4 0" />
  </svg>
);
export const News = (props: P) => (
  <svg {...base(props)}>
    <path d="M4 5a1 1 0 011-1h11a1 1 0 011 1v14a1 1 0 001 1H6a2 2 0 01-2-2z" />
    <path d="M20 8v9a2 2 0 01-2 2" />
    <path d="M8 8h6M8 12h6M8 16h4" />
  </svg>
);
export const Code = (props: P) => (
  <svg {...base(props)}>
    <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" />
  </svg>
);
export const Settings = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
  </svg>
);
export const Search = (props: P) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
export const Bolt = (props: P) => (
  <svg {...base(props)}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </svg>
);
export const Plus = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const Check = (props: P) => (
  <svg {...base(props)}>
    <path d="M4 12l5 5L20 6" />
  </svg>
);
export const X = (props: P) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const ChevronRight = (props: P) => (
  <svg {...base(props)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const ArrowUpRight = (props: P) => (
  <svg {...base(props)}>
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
);
export const Copy = (props: P) => (
  <svg {...base(props)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 012-2h10" />
  </svg>
);
export const Trash = (props: P) => (
  <svg {...base(props)}>
    <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
  </svg>
);
export const Menu = (props: P) => (
  <svg {...base(props)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);
export const Globe = (props: P) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
  </svg>
);
export const Lock = (props: P) => (
  <svg {...base(props)}>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);
export const Mail = (props: P) => (
  <svg {...base(props)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
export const Eye = (props: P) => (
  <svg {...base(props)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const Download = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3v12M7 11l5 5 5-5M5 21h14" />
  </svg>
);
export const Star = (props: P) => (
  <svg {...base(props)}>
    <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z" />
  </svg>
);
export const Pause = (props: P) => (
  <svg {...base(props)}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);
