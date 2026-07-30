# Graph Report - .  (2026-07-31)

## Corpus Check
- Corpus is ~33,267 words - fits in a single context window. You may not need a graph.

## Summary
- 833 nodes · 1372 edges · 92 communities (38 shown, 54 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.82)
- Token cost: 66,728 input · 0 output

## Community Hubs (Navigation)
- Agent Reasoning Core (loop, tools, memory, recovery)
- Dashboard UI & Marketing Pages
- Sidebar & Overlay UI Kit
- Lint & Build Tooling Config
- Form & Chart UI Primitives
- Locked Architecture & Hackathon Docs
- Frontend TypeScript Config
- Form Control UI Kit
- Backend Data Access & Server Actions
- Table & Pagination UI Kit
- Approval Dialog UI
- Backend TypeScript Config
- LLM Provider Abstraction
- shadcn Component Config
- Menubar UI Component
- Alert Dialog & Button UI
- Misc Runtime Dependencies
- Context Menu UI Component
- Dropdown Menu UI Component
- Table UI Component
- Crawler Policy & Dashboard Ownership
- Breadcrumb UI Component
- Drawer UI Component
- Navigation Menu UI Component
- Select UI Component
- Card UI Component
- Toggle UI Component
- Seed Email Scrubbing Script
- OTP Input UI Component
- Gmail OAuth Setup
- Root Layout & Fonts
- Avatar UI Component
- Badge UI Component
- Tabs UI Component
- Toast Notifications (Sonner)
- Git Hooks Setup Script
- class-variance-authority Dependency
- cmdk Dependency
- date-fns Dependency
- dotenv Dependency
- embla-carousel-react Dependency
- Google Generative AI Dependency
- googleapis Dependency
- hookform-resolvers Dependency
- input-otp Dependency
- Framer Motion Dependency
- Next.js Package Dependency
- next.config.ts
- next-env.d.ts
- open Dependency
- Radix Accordion Dependency
- Radix Alert Dialog Dependency
- Radix Aspect Ratio Dependency
- Radix Avatar Dependency
- Radix Checkbox Dependency
- Radix Collapsible Dependency
- Radix Context Menu Dependency
- Radix Dialog Dependency
- Radix Dropdown Menu Dependency
- Radix Label Dependency
- Radix Menubar Dependency
- Radix Navigation Menu Dependency
- Radix Popover Dependency
- Radix Progress Dependency
- Radix Radio Group Dependency
- Radix Scroll Area Dependency
- Radix Separator Dependency
- Radix Slider Dependency
- Radix Slot Dependency
- Radix Switch Dependency
- Radix Tabs Dependency
- Radix Toggle Dependency
- Radix Tooltip Dependency
- react-day-picker Dependency
- react-dom Dependency
- react-hook-form Dependency
- react-resizable-panels Dependency
- recharts Dependency
- sonner Dependency
- @supabase/supabase-js Dependency
- tailwind-merge Dependency
- tailwindcss Dependency
- tw-animate-css Dependency
- vaul Dependency
- zod Dependency
- The One Rule (isolated node)
- Next.js (framework, isolated node)

## God Nodes (most connected - your core abstractions)
1. `cn()` - 99 edges
2. `compilerOptions` - 17 edges
3. `getDecisions()` - 15 edges
4. `File ownership table` - 15 edges
5. `recordOutcome()` - 13 edges
6. `dispatchTool()` - 13 edges
7. `Decision` - 12 edges
8. `seedInvoices` - 11 edges
9. `getInvoices()` - 11 edges
10. `scripts` - 10 edges

## Surprising Connections (you probably didn't know these)
- `README human-in-the-loop description: send_reminder_email pre-approved only, else ask_human` --semantically_similar_to--> `Human-in-the-loop split (gated vs autonomous actions)`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Provider boundary: only lib/llm.ts imports @google/generative-ai` --semantically_similar_to--> `Provider abstraction over LLM vendor (lib/llm.ts)`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Loop actively detects fake tool use (text-narrated tool name) and nudges model to take a real action` --semantically_similar_to--> `Rule 1: Real function calling only`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `README manualProcedure description: teaches reasoning, not a call log` --semantically_similar_to--> `Rule 3: Every decision carries manualProcedure: string[]`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Avoid rewriting published git history (no force-push/rebase/amend/squash) to keep Lovable sync intact` --semantically_similar_to--> `Git workflow rule: Claude Code must not commit/push without explicit instruction`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Five tool categories implement one shared adapter interface** — claude_five_tool_categories, claude_accounting_tool, claude_email_tool, claude_payments_tool, claude_crm_tool, claude_calendar_sms_tool [EXTRACTED 1.00]
- **Seeded scenarios each prove one distinct autonomous-reasoning behaviour** — scenario_loyal_payer, scenario_promise_breaker, scenario_open_renewal, scenario_reconciliation_short_payment, scenario_low_confidence [EXTRACTED 1.00]
- **robots.txt crawler allowlist policy** — public_robots_googlebot, public_robots_bingbot, public_robots_twitterbot, public_robots_facebookexternalhit, public_robots_wildcard [EXTRACTED 1.00]

## Communities (92 total, 54 thin omitted)

### Community 0 - "Agent Reasoning Core (loop, tools, memory, recovery)"
Cohesion: 0.05
Nodes (82): classifyReply(), ReplyClassification, checkForcedFailure(), forceToolFailure(), shouldForceFailure(), buildStubDecision(), buildTurnBudgetEscalation(), deriveStatus() (+74 more)

### Community 1 - "Dashboard UI & Marketing Pages"
Cohesion: 0.05
Nodes (57): metadata, autonomous, FeaturePage(), FEATURES, gated, generateMetadata(), isSlug(), ladder (+49 more)

### Community 2 - "Sidebar & Overlay UI Kit"
Cohesion: 0.05
Nodes (39): Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+31 more)

### Community 3 - "Lint & Build Tooling Config"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies (+35 more)

### Community 4 - "Form & Chart UI Primitives"
Cohesion: 0.05
Nodes (36): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+28 more)

### Community 5 - "Locked Architecture & Hackathon Docs"
Cohesion: 0.05
Nodes (41): Avoid rewriting published git history (no force-push/rebase/amend/squash) to keep Lovable sync intact, Lovable (connected external platform, lovable.dev), Accounting tool category (QuickBooks/Xero, simulated), Calendar + SMS tool category (Google Cal/Twilio/Ideamart, simulated), CRM tool category (HubSpot/Zoho, simulated), Decisions and Why (Supabase, Gemini, Gmail, manualProcedure, code freeze rationale), Email tool category (Gmail/Outlook, LIVE), Error recovery ladder (retry, fallback, degrade, escalate) (+33 more)

### Community 6 - "Frontend TypeScript Config"
Cohesion: 0.05
Nodes (37): app/**/*.ts, app/**/*.tsx, components/**/*.ts, components/**/*.tsx, DOM, DOM.Iterable, ES2022, hooks/**/*.ts (+29 more)

### Community 7 - "Form Control UI Kit"
Cohesion: 0.07
Nodes (17): AccordionContent, AccordionItem, AccordionTrigger, Alert, AlertDescription, AlertTitle, alertVariants, Checkbox (+9 more)

### Community 8 - "Backend Data Access & Server Actions"
Cohesion: 0.15
Nodes (16): submitHumanAction(), ApprovalsPage(), metadata, DecisionDetailPage(), DecisionsPage(), metadata, OverviewPage(), Landing() (+8 more)

### Community 9 - "Table & Pagination UI Kit"
Cohesion: 0.13
Nodes (18): DataCell(), DataRow(), DataTable(), Toggle(), NotificationBell(), Pagination(), Pagination(), PaginationContent (+10 more)

### Community 10 - "Approval Dialog UI"
Cohesion: 0.12
Nodes (17): COPY, HumanActionDialog(), Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList (+9 more)

### Community 11 - "Backend TypeScript Config"
Cohesion: 0.10
Nodes (20): app, components, compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir (+12 more)

### Community 12 - "LLM Provider Abstraction"
Cohesion: 0.15
Nodes (19): Provider abstraction over LLM vendor (lib/llm.ts), DECISION_SCHEMA, DecisionOutput, extractSystemText(), generateDecision(), generateWithTools(), getClient(), JsonSchemaType (+11 more)

### Community 13 - "shadcn Component Config"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 14 - "Menubar UI Component"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 15 - "Alert Dialog & Button UI"
Cohesion: 0.17
Nodes (13): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+5 more)

### Community 16 - "Misc Runtime Dependencies"
Cohesion: 0.15
Nodes (13): clsx, express, lucide-react, dependencies, clsx, express, lucide-react, @radix-ui/react-hover-card (+5 more)

### Community 17 - "Context Menu UI Component"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 18 - "Dropdown Menu UI Component"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 19 - "Table UI Component"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 20 - "Crawler Policy & Dashboard Ownership"
Cohesion: 0.25
Nodes (8): app/** (Next.js dashboard, approval queue, audit trail, teach-me panel), Mansandi (team member), Bingbot allow rule, facebookexternalhit allow rule, public/robots.txt (crawler access policy), Googlebot allow rule, Twitterbot allow rule, Wildcard User-agent: * allow rule

### Community 21 - "Breadcrumb UI Component"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 22 - "Drawer UI Component"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 23 - "Navigation Menu UI Component"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 24 - "Select UI Component"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 25 - "Card UI Component"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 26 - "Toggle UI Component"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 27 - "Seed Email Scrubbing Script"
Cohesion: 0.67
Nodes (4): main(), readStdin(), scrubSeedEmails(), selfCheck()

### Community 28 - "OTP Input UI Component"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 29 - "Gmail OAuth Setup"
Cohesion: 0.40
Nodes (3): credentials, oAuth2Client, SCOPES

### Community 31 - "Avatar UI Component"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 32 - "Badge UI Component"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

### Community 33 - "Tabs UI Component"
Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

## Knowledge Gaps
- **399 isolated node(s):** `trail`, `escalation`, `evidence`, `blockedEmail`, `blockedSms` (+394 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Table & Pagination UI Kit` to `Dashboard UI & Marketing Pages`, `Sidebar & Overlay UI Kit`, `Form & Chart UI Primitives`, `Form Control UI Kit`, `Approval Dialog UI`, `Menubar UI Component`, `Alert Dialog & Button UI`, `Context Menu UI Component`, `Dropdown Menu UI Component`, `Table UI Component`, `Breadcrumb UI Component`, `Drawer UI Component`, `Navigation Menu UI Component`, `Select UI Component`, `Card UI Component`, `Toggle UI Component`, `OTP Input UI Component`, `Avatar UI Component`, `Badge UI Component`, `Tabs UI Component`?**
  _High betweenness centrality (0.407) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Misc Runtime Dependencies` to `Lint & Build Tooling Config`, `Form & Chart UI Primitives`, `class-variance-authority Dependency`, `cmdk Dependency`, `date-fns Dependency`, `dotenv Dependency`, `embla-carousel-react Dependency`, `Google Generative AI Dependency`, `googleapis Dependency`, `hookform-resolvers Dependency`, `input-otp Dependency`, `Framer Motion Dependency`, `Next.js Package Dependency`, `open Dependency`, `Radix Accordion Dependency`, `Radix Alert Dialog Dependency`, `Radix Aspect Ratio Dependency`, `Radix Avatar Dependency`, `Radix Checkbox Dependency`, `Radix Collapsible Dependency`, `Radix Context Menu Dependency`, `Radix Dialog Dependency`, `Radix Dropdown Menu Dependency`, `Radix Label Dependency`, `Radix Menubar Dependency`, `Radix Navigation Menu Dependency`, `Radix Popover Dependency`, `Radix Progress Dependency`, `Radix Radio Group Dependency`, `Radix Scroll Area Dependency`, `Radix Separator Dependency`, `Radix Slider Dependency`, `Radix Slot Dependency`, `Radix Switch Dependency`, `Radix Tabs Dependency`, `Radix Toggle Dependency`, `Radix Tooltip Dependency`, `react-day-picker Dependency`, `react-dom Dependency`, `react-hook-form Dependency`, `react-resizable-panels Dependency`, `recharts Dependency`, `sonner Dependency`, `@supabase/supabase-js Dependency`, `tailwind-merge Dependency`, `tailwindcss Dependency`, `tw-animate-css Dependency`, `vaul Dependency`, `zod Dependency`?**
  _High betweenness centrality (0.277) - this node is a cross-community bridge._
- **Why does `react` connect `Form & Chart UI Primitives` to `Misc Runtime Dependencies`, `Sidebar & Overlay UI Kit`, `Alert Dialog & Button UI`?**
  _High betweenness centrality (0.250) - this node is a cross-community bridge._
- **What connects `trail`, `escalation`, `evidence` to the rest of the system?**
  _399 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Agent Reasoning Core (loop, tools, memory, recovery)` be split into smaller, more focused modules?**
  _Cohesion score 0.050669772859638904 - nodes in this community are weakly interconnected._
- **Should `Dashboard UI & Marketing Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.0515406162464986 - nodes in this community are weakly interconnected._
- **Should `Sidebar & Overlay UI Kit` be split into smaller, more focused modules?**
  _Cohesion score 0.05217391304347826 - nodes in this community are weakly interconnected._