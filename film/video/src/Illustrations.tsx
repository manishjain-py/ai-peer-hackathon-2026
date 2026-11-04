import React, {useId} from 'react';

/** Original, resolution-independent artwork for the AI Peer concept film. */
const ink = '#172934';
const cream = '#F8F5ED';
const coral = '#FF6758';
const mint = '#BDEBCB';
const blue = '#6FAFF5';
const purple = '#7162D0';

export type AvatarProps = {
  kind: 'manish' | 'sarah' | 'jordan';
  size: number;
  style?: React.CSSProperties;
};

const Manish = () => (
  <>
    {/* A generous shirt silhouette stays legible at small sizes. */}
    <path d="M30 203c3-36 22-56 55-60h29c35 5 54 24 58 60" fill={coral} />
    <path d="M82 130h36v23c-3 11-32 14-36 0Z" fill="#AD6848" />
    <path d="m76 147 24 17 24-17 7 10-16 22-15-9-16 9-15-22Z" fill="#E95348" />
    <path d="M61 77c-2-35 12-55 40-55 28 0 42 18 39 56l-5 34H68Z" fill={ink} />
    <ellipse cx="64" cy="103" rx="9" ry="14" fill="#B97650" />
    <ellipse cx="136" cy="103" rx="9" ry="14" fill="#B97650" />
    <path d="M67 66c7-11 18-15 33-15 19 0 32 7 33 22v36c0 25-14 40-33 40s-33-15-33-40Z" fill="#C98A60" />
    <path d="M64 78c-4-25 7-46 29-49 20-4 40 7 45 30l-6 20-8-19c-10 4-28 3-42-4L69 81Z" fill={ink} />
    <path d="M80 85c5-3 11-3 15-1m12 0c5-2 11-2 16 1" fill="none" stroke="#613E32" strokeWidth="4" strokeLinecap="round" />
    <rect x="70" y="90" width="28" height="22" rx="8" fill="#F8F5ED" fillOpacity=".12" stroke={ink} strokeWidth="4" />
    <rect x="104" y="90" width="28" height="22" rx="8" fill="#F8F5ED" fillOpacity=".12" stroke={ink} strokeWidth="4" />
    <path d="M98 97h6m-40-4 6 2m62 0 5-2" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="86" cy="100" rx="2.4" ry="3.1" fill={ink} />
    <ellipse cx="116" cy="100" rx="2.4" ry="3.1" fill={ink} />
    <path d="m102 104-3 13h6" fill="none" stroke="#A46445" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M89 127c7 6 17 6 23-1" fill="none" stroke="#724234" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M91 128c5 2 12 2 17-1" stroke={cream} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M60 183v19m81-19v19" stroke="#D94D43" strokeWidth="3" strokeLinecap="round" />
  </>
);

const Sarah = () => (
  <>
    <path d="M45 139c-13-18-15-40-8-59-5-17 4-30 17-36 4-20 26-29 44-25 21-5 38 5 45 19 17 4 24 19 19 34 13 19 8 37-1 49 2 23-17 44-44 42H72c-14-2-24-10-27-24" fill={ink} />
    <path d="M26 205c4-36 24-57 58-61h33c35 6 55 26 59 61" fill={mint} />
    <path d="M84 128h34v25c-4 15-30 15-34 0Z" fill="#905837" />
    <path d="M73 149c7 19 42 25 57 0l9 5c-11 35-62 35-75 0Z" fill="#9CD9B0" />
    <ellipse cx="64" cy="104" rx="8" ry="13" fill="#A66A44" />
    <ellipse cx="139" cy="104" rx="8" ry="13" fill="#A66A44" />
    <path d="M66 70c7-15 20-21 38-20 23 2 33 16 33 38v25c-2 25-16 39-35 39-21 0-36-18-36-40Z" fill="#AD754E" />
    <path d="M60 90c-4-16 2-41 21-46 12-13 40-6 50 7 10 2 15 17 8 31-10-6-20-17-21-27-10 16-34 23-55 19Z" fill={ink} />
    <circle cx="62" cy="65" r="14" fill={ink} />
    <circle cx="82" cy="48" r="16" fill={ink} />
    <circle cx="109" cy="46" r="16" fill={ink} />
    <circle cx="133" cy="59" r="15" fill={ink} />
    <path d="M76 90c5-3 11-3 16 0m19 0c5-3 11-2 15 1" fill="none" stroke="#49382D" strokeWidth="3.6" strokeLinecap="round" />
    <ellipse cx="86" cy="103" rx="3" ry="3.8" fill={ink} />
    <ellipse cx="119" cy="103" rx="3" ry="3.8" fill={ink} />
    <path d="m103 106-3 13h6" fill="none" stroke="#8B512F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M89 130c8 8 19 7 26-2" fill="#6B3931" />
    <path d="M93 130c5 3 13 2 18-1" stroke={cream} strokeWidth="3" strokeLinecap="round" />
    <circle cx="63" cy="119" r="5" fill={coral} />
    <circle cx="139" cy="119" r="5" fill={coral} />
    <path d="M54 190v13m91-13v13" stroke="#86C59A" strokeWidth="3" strokeLinecap="round" />
  </>
);

const Jordan = () => (
  <>
    <path d="M28 205c3-35 24-57 59-62h29c34 5 55 27 59 62" fill={blue} />
    <path d="M84 131h33v23c-5 13-28 13-33 0Z" fill="#D89D76" />
    <path d="M78 148c8 14 34 16 46 0l8 7c-14 23-47 22-61 0Z" fill="#508DDD" />
    <path d="M61 82c-1-30 14-53 42-52 29 0 43 22 38 52l-8 39H67Z" fill="#6B493A" />
    <ellipse cx="63" cy="105" rx="8" ry="13" fill="#E7AF87" />
    <ellipse cx="137" cy="105" rx="8" ry="13" fill="#E7AF87" />
    <path d="M67 72c4-13 17-20 33-20 20 0 33 10 34 29v32c-2 23-15 38-34 38-20 0-33-16-33-39Z" fill="#F0BC94" />
    <path d="M61 86c-3-22 2-35 13-44 11-10 21-11 29-10 12-10 24-6 24-6l-4 11c15 5 22 18 19 37l-9 15-7-23c-16 5-28 2-40-5L69 88Z" fill="#6B493A" />
    <path d="M75 51c9-9 23-10 34-7" fill="none" stroke="#886046" strokeWidth="6" strokeLinecap="round" />
    <path d="M77 91c5-2 11-3 16 0m16 0c5-3 12-2 16 0" fill="none" stroke="#76503A" strokeWidth="3.6" strokeLinecap="round" />
    <ellipse cx="86" cy="103" rx="3" ry="3.8" fill={ink} />
    <ellipse cx="118" cy="103" rx="3" ry="3.8" fill={ink} />
    <path d="m102 106-3 13h6" fill="none" stroke="#CD8E66" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M88 129c8 7 19 7 26-1" fill="none" stroke="#8F5946" strokeWidth="3.1" strokeLinecap="round" />
    <circle cx="76" cy="114" r="2" fill="#CB8D68" />
    <circle cx="82" cy="117" r="1.5" fill="#CB8D68" />
    <circle cx="124" cy="115" r="2" fill="#CB8D68" />
    <path d="M56 185v19m88-19v19" stroke="#508DDD" strokeWidth="3" strokeLinecap="round" />
  </>
);

/** Fictional demo personas, drawn as circular portraits with transparent corners. */
export const Avatar: React.FC<AvatarProps> = ({kind, size, style}) => {
  const clipId = `peer-avatar-${useId().replace(/:/g, '')}`;
  const background = {manish: '#FFE3D6', sarah: '#E4DEF7', jordan: '#D5EBD9'}[kind];
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" role="img" aria-label={`Illustrated ${kind} demo persona`} style={{display: 'block', flexShrink: 0, ...style}}>
      <defs><clipPath id={clipId}><circle cx="100" cy="100" r="100" /></clipPath></defs>
      <g clipPath={`url(#${clipId})`}>
        <path fill={background} d="M0 0h200v200H0z" />
        <circle cx="184" cy="36" r="64" fill={cream} fillOpacity=".35" />
        <circle cx="7" cy="175" r="68" fill={cream} fillOpacity=".25" />
        {kind === 'manish' ? <Manish /> : kind === 'sarah' ? <Sarah /> : <Jordan />}
      </g>
    </svg>
  );
};

export type PeerMarkProps = {
  size: number;
  style?: React.CSSProperties;
  accent?: string;
};

/** Two companion loops on a dark backplate, readable on any scene background. */
export const PeerMark: React.FC<PeerMarkProps> = ({size, style, accent = coral}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" role="img" aria-label="AI Peer companion mark" style={{display: 'block', flexShrink: 0, ...style}}>
    <rect width="200" height="200" rx="52" fill={ink} />
    <g transform="translate(14 14) scale(.86)">
    <g transform="rotate(-12 76 100)">
      <path fill={cream} fillRule="evenodd" d="M76 22c-30 0-51 23-51 54v49c0 31 21 53 51 53s51-22 51-53V76c0-31-21-54-51-54Zm0 56c-13 0-21 10-21 25v22c0 15 8 24 21 24s21-9 21-24v-22c0-15-8-25-21-25Z" clipRule="evenodd" />
      <path d="M65 52v6m21-6v6" stroke={ink} strokeWidth="5.5" strokeLinecap="round" />
    </g>
    <g transform="rotate(12 125 102)">
      <path fill={accent} fillRule="evenodd" d="M125 27c-29 0-50 23-50 53v49c0 31 21 53 50 53s50-22 50-53V80c0-30-21-53-50-53Zm0 56c-12 0-21 10-21 25v21c0 15 9 24 21 24s21-9 21-24v-21c0-15-9-25-21-25Z" clipRule="evenodd" />
      <path d="M115 57v6m20-6v6" stroke={ink} strokeWidth="5.5" strokeLinecap="round" />
    </g>
    </g>
  </svg>
);

export type IconProps = {name: string; size: number; color?: string};

/** Lightweight line icons sharing one optical weight and a 24-unit grid. */
export const Icon: React.FC<IconProps> = ({name, size, color = ink}) => {
  const shapes: Record<string, React.ReactNode> = {
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    'arrow-up-right': <path d="M6 18 18 6M6 6h12v12" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    code: <><path d="m7 6-5 6 5 6m10-12 5 6-5 6m-4-14-2 16" /></>,
    branch: <><circle cx="6" cy="5" r="2.5" /><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M6 8v8m0-3h5c4 0 7-2 7-4" /></>,
    merge: <><circle cx="6" cy="5" r="2.5" /><circle cx="18" cy="5" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M6 8c0 6 12 2 12 8m0-8v8" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    chat: <path d="M20 11a8 8 0 0 1-8 8H8l-5 3V11a8 8 0 0 1 17 0Z" />,
    heart: <path d="M12 20 4.6 13C-2 6.5 6 0 12 6c6-6 14 0.5 7.4 7Z" />,
    shield: <><path d="m12 2 8 4v6c0 5-8 10-8 10s-8-5-8-10V6Z" /><path d="m8 12 3 3 5-6" /></>,
    play: <path d="m8 4 12 8-12 8Z" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    book: <><path d="M12 5C8 2 3 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-1-1-6-2-10 1Zm0 0v15" /></>,
    terminal: <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m6 9 3 3-3 3m7 0h5" /></>,
    users: <><circle cx="9" cy="7" r="3" /><path d="M2 20v-2c0-4 3-6 7-6s7 2 7 6v2m1-16c4 1 4 6 0 7m2 3c3 1 3 3 3 6" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
    activity: <path d="M2 13h5l3-9 4 16 3-7h5" />,
    link: <><path d="m10 14 4-4m-6 5-2 2a3.5 3.5 0 0 0 5 5l4-4a3.5 3.5 0 0 0 0-5m-6-2a3.5 3.5 0 0 1 0-5l4-4a3.5 3.5 0 0 1 5 5l-2 2" transform="translate(0 -1)" /></>,
    bolt: <path d="m14 2-11 12h8l-1 8 11-12h-8Z" />,
    spark: <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z" /></>,
  };
  const aliases: Record<string, string> = {send: 'arrow', people: 'users', message: 'chat', sparkle: 'spark', git: 'branch', 'git-branch': 'branch', 'git-merge': 'merge', 'arrow-right': 'arrow'};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{display: 'block', flexShrink: 0, color}}>
      {shapes[aliases[name] ?? name] ?? shapes.spark}
    </svg>
  );
};

export const illustrationPalette = {ink, cream, coral, mint, blue, purple};
