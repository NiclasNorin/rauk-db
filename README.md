# My Site — Pokémon Card Collection Browser

A web app for browsing and managing a personal collection of graded Pokémon trading cards. Built with [Lit](https://lit.dev/) web components, TypeScript, and Vite.

## Features

- Browse graded cards with sub-grade details (Center, Edges, Surface, Corners)
- Filter by language, set, and grade; sort and search
- Paginated grid (60 cards per page)
- Card detail modal with grade distribution and TCGdex card data (image, rarity, illustrator)
- Data sourced from a Google Sheet via the OpenSheet API

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Lit](https://lit.dev/) v3 | Web components |
| TypeScript v5 | Type safety |
| Vite v5 | Dev server & bundler |
| SCSS/Sass | Styling |
| [Tom Select](https://tom-select.js.org/) | Dropdown UI |
| [@tcgdex/sdk](https://tcgdex.dev/) | Pokémon TCG card data |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173) with hot module replacement.

### Build for production

```bash
npm run build
```

Runs `tsc` (type checking) followed by `vite build`. Output goes to `dist/`.

### Preview production build

```bash
npm run preview
```

Serves the `dist/` folder locally to verify the production build.

## Project Structure

```
src/
├── components/
│   ├── rauk-app.ts        # Root component — data fetching, filter state
│   ├── rauk-filter-bar.ts # Search & filter controls
│   ├── rauk-card.ts       # Individual card tile
│   ├── rauk-card-grid.ts  # Card grid with pagination
│   └── rauk-modal.ts      # Card detail modal (TCGdex integration)
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   ├── utils.ts           # Filtering & formatting helpers
│   └── tcgdex.ts          # TCGdex API helpers
└── styles/                # SCSS modules and design tokens
```

## License

MIT © Niclas Norin
