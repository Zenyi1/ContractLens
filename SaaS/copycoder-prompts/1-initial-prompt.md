Initialize Next.js in current directory:
```bash
mkdir temp; cd temp; npx create-next-app@latest . -y --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*" -no --turbo
```

Now let's move back to the parent directory and move all files except prompt.md.

For Windows (PowerShell):
```powershell
cd ..; Move-Item -Path "temp*" -Destination . -Force; Remove-Item -Path "temp" -Recurse -Force
```

For Mac/Linux (bash):
```bash
cd .. && mv temp/* temp/.* . 2>/dev/null || true && rm -rf temp
```

Set up the frontend according to the following prompt:
<frontend-prompt>
Create detailed components with these requirements:
1. Use 'use client' directive for client-side components
2. Make sure to concatenate strings correctly using backslash
3. Style with Tailwind CSS utility classes for responsive design
4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
7. Create root layout.tsx page that wraps necessary navigation items to all pages
8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
9. Accurately implement necessary grid layouts
10. Follow proper import practices:
   - Use @/ path aliases
   - Keep component imports organized
   - Update current src/app/page.tsx with new comprehensive code
   - Don't forget root route (page.tsx) handling
   - You MUST complete the entire prompt before stopping

<summary_title>
AI-Powered Data Analytics Dashboard Landing Page
</summary_title>

<image_analysis>

1. Navigation Elements:
- Top header with: Features, Pricing, Blog, Changelog, Careers, Demo, Log in
- Product version banner: "IndexAI 1.0 - Early Preview"


2. Layout Components:
- Full-width header (100%)
- Center-aligned hero section (max-width: 1200px)
- Dashboard preview section (max-width: 1200px)
- Content padding: 24px horizontal, 48px vertical
- Responsive container with 32px gutters


3. Content Sections:
- Hero section with headline, subtitle, and CTA
- Dashboard preview with:
  - User signups graph (line chart)
  - Revenue by city (donut chart)
  - Customer spending metrics
- Team collaboration interface with avatars and controls


4. Interactive Controls:
- "Sign Up" primary CTA button
- Add button (+)
- More options menu (...)
- User avatar controls
- Chart interaction elements


5. Colors:
- Primary: #FF6B4A (coral)
- Secondary: #333333 (dark gray)
- Background: #FFFFFF (white)
- Accent: #20B15A (green)
- Chart colors: Various pastels for data visualization


6. Grid/Layout Structure:
- 12-column grid system
- 24px baseline grid
- Dashboard cards: 3-column layout
- Responsive breakpoints at 768px, 1024px, 1440px
</image_analysis>

<development_planning>

1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Header
│   │   ├── Hero
│   │   └── Dashboard
│   ├── features/
│   │   ├── Charts
│   │   ├── UserMetrics
│   │   └── TeamControls
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
```


2. Key Features:
- Real-time data visualization
- Team collaboration tools
- User analytics tracking
- Interactive dashboard controls


3. State Management:
```typescript
interface AppState {
├── dashboard: {
│   ├── userSignups: SignupData[]
│   ├── revenueData: RevenueMetrics
│   ├── customerSpending: SpendingMetrics
├── }
├── user: {
│   ├── profile: UserProfile
│   ├── preferences: UserPreferences
│   └── team: TeamMember[]
├── }
}
```


4. Routes:
```typescript
const routes = [
├── '/',
├── '/dashboard/*',
├── '/features/*',
├── '/team/*',
└── '/settings/*'
]
```


5. Component Architecture:
- DashboardLayout (parent)
- ChartComponents (reusable)
- MetricsDisplay (shared)
- TeamInterface (feature)


6. Responsive Breakpoints:
```scss
$breakpoints: (
├── 'mobile': 320px,
├── 'tablet': 768px,
├── 'desktop': 1024px,
└── 'wide': 1440px
);
```
</development_planning>
</frontend-prompt>

IMPORTANT: Please ensure that (1) all KEY COMPONENTS and (2) the LAYOUT STRUCTURE are fully implemented as specified in the requirements. Ensure that the color hex code specified in image_analysis are fully implemented as specified in the requirements.