Set up the page structure according to the following prompt:
   
<page-structure-prompt>
Next.js route structure based on navigation menu items (excluding main route). Make sure to wrap all routes with the component:

Routes:
- /features
- /pricing
- /blog
- /changelog
- /careers
- /demo
- /log-in

Page Implementations:
/features:
Core Purpose: Showcase product capabilities and main selling points
Key Components
- Feature cards with icons and descriptions
- Interactive demos

/signup
Layout Structure:
- Hero section with main value proposition
- Grid layout for feature cards
- Alternating text

/pricing:
Core Purpose: Display pricing plans and subscription options
Key Components
- Pricing plan cards
- Feature comparison table
- FAQ accordion
- Custom plan calculator
Layout Structure
- Pricing toggle (monthly

/blog:
Core Purpose: Share company news, tutorials, and industry insights
Key Components
- Blog post cards
- Category filters
- Search functionality
- Newsletter signup
Layout Structure
- Featured post hero
- Post grid (3 columns)
- Sidebar with categories

/changelog:
Core Purpose: Document product updates and improvements
Key Components
- Version history timeline
- Update cards with details
- Category filters
- Search functionality
Layout Structure
- Chronological timeline
- Filterable grid
- Expandable update details
- Mobile-friendly list view

/careers:
Core Purpose: List job openings and company culture
Key Components
- Job listing cards
- Department filters
- Application forms
- Culture section
Layout Structure
- Culture showcase hero
- Job categories grid
- Filterable job listings
- Mobile-optimized application flow

/demo:
Core Purpose: Product demonstration and trial signup
Key Components
- Interactive product demo
- Form for demo request
- Feature highlights
- Calendar integration
Layout Structure
- Split screen layout
- Demo preview
- Form sidebar
- Mobile-first responsive design

/log-in:
Core Purpose: User authentication
Key Components
- Login form
- Social login options
- Password reset
- 2FA integration
Layout Structure
- Centered card layout
- Form validation
- Error messaging
- Mobile-optimized input fields

Layouts:
MainLayout:
- Applicable routes: All except /log-in
- Core components
  - Navigation header
  - Footer
  - Sidebar (where applicable)
  - Content area
- Responsive behavior
  - Collapsible navigation on mobile
  - Fluid content width
  - Responsive padding/margins

AuthLayout
- Applicable routes: /log-in
- Core components
  - Minimal header
  - Auth form container
  - Brand elements
- Responsive behavior
  - Centered card design
  - Full-width on mobile
  - Adjustable form inputs

BlogLayout
- Applicable routes: /blog
- Core components
  - Category navigation
  - Content area
  - Sidebar
  - Newsletter signup
- Responsive behavior
  - Sidebar moves to bottom on mobile
  - Responsive typography
  - Collapsible categories
</page-structure-prompt>