# Portfolio Site

A studio-editorial portfolio built with vanilla JS, no frameworks or bundlers.

## Features

- **Scroll-linked hero morph** — continuous interpolation over scroll distance
- **Background video layer** with reduced-motion and save-data fallbacks
- **Collapsible showcase categories** — Video, 3D, GitHub repos
- **Markdown blog** with frontmatter parsing
- **Dual-endpoint contact form** — Discord webhook + Google Sheets
- **Fully static** — hosted on GitHub Pages, no backend

## Structure

```
/
├── index.html                    # main landing page
├── pages/
│   ├── blog.html                 # blog listing + post view
│   └── contact.html              # standalone contact page
├── css/styles.css                # single stylesheet, theme-variable driven
├── js/
│   ├── state.js                  # pub/sub event bus
│   ├── theme.js                  # color palette + CSS var injection
│   ├── loader.js                 # loading screen controller
│   ├── hero.js                   # background video + fallback
│   ├── hero-morph.js             # scroll-linked morph logic
│   ├── md-utils.js               # frontmatter + markdown parser
│   ├── video-parser.js           # videos.md → structured data
│   ├── showcase.js               # collapsible category component
│   ├── github.js                 # GitHub API + cache + fallback
│   ├── blog-parser.js            # blog index + post rendering
│   └── contact-form.js           # form validation + dual submit
├── content/
│   ├── videos.md                 # video showcase entries
│   ├── github-fallback.json      # static repo list
│   ├── blog-index.json           # array of blog post filenames
│   └── blog/*.md                 # blog posts with frontmatter
└── assets/
    ├── video/                    # background video file
    ├── fallback/                 # fallback gradient assets
    └── icons/                    # social icons
```
