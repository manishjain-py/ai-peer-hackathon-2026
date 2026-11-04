# Original vector illustrations

`video/src/Illustrations.tsx` contains original inline SVG artwork authored for the AI Peer hackathon concept film. It uses React only, with no external assets, fonts, illustration packages, raster images, or animation timers.

## Assets

- **Avatar** — circular, shoulder-up portraits of the fictional demo personas Manish, Sarah, and Jordan. Manish has warm brown skin, dark hair, glasses, and a coral shirt. Sarah has medium brown skin, dark curly hair, coral earrings, and a mint shirt. Jordan has light skin, short brown hair, and a blue shirt. These are invented illustrations, not likenesses of real people.
- **PeerMark** — an original abstract pair of rounded companion loops in warm white and coral, with small friendly eyes. An ink rounded-square backplate keeps both loops readable on cream, coral, mint, and dark scene backgrounds. An `accent` prop changes the coral companion when required by a scene. There is no relationship to an existing brand logo.
- **Icon** — original, optically consistent line icons for simple interface and story beats. Available names: `check`, `close`, `arrow`, `arrow-up-right`, `chevron`, `search`, `code`, `branch`, `merge`, `clock`, `chat`, `heart`, `shield`, `play`, `pause`, `book`, `terminal`, `users`, `target`, `eye`, `lock`, `activity`, `link`, `bolt`, and `spark`. Common aliases are accepted, and unknown names fall back to `spark`.
- **illustrationPalette** — shared ink, cream, coral, mint, blue, and purple color constants.

## Use

```tsx
import {Avatar, PeerMark, Icon} from './Illustrations';

<Avatar kind="manish" size={112} />
<Avatar kind="sarah" size={80} />
<Avatar kind="jordan" size={48} />
<PeerMark size={200} />
<Icon name="branch" size={24} color="#172934" />
```

Every asset has a viewBox and scales without loss of detail. Portrait clipping IDs use React's `useId` to support multiple instances. Portraits and marks accept inline `style` for scene positioning and frame-driven transforms; their state is otherwise static. The portraits have transparent corners and contain their own pastel background circles. For small interface appearances, use portraits at 48 px or larger and icons at 20 px or larger.

The portrait silhouettes, shirt colors, and hair shapes carry the identity at thumbnail size. Facial details reward the larger close-ups used in the film. The companion mark is deliberately simple enough to hold at 48 px while giving the opening and closing scenes an expressive symbol at 200 px and above.
