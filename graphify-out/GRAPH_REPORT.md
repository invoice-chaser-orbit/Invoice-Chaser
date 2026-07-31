# Graph Report - . (2026-07-31)

## Corpus Check

- 11 files · ~34,100 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 847 nodes · 1375 edges · 99 communities (45 shown, 54 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- Marketing pages & feature dialogs
- Dashboard pages & persistence layer
- React carousel/sidebar UI primitives
- Sidebar & sheet UI primitives
- Package tooling & lint config
- Locked architecture docs (CLAUDE.md/README)
- TS config (frontend)
- Misc shadcn UI primitives
- Decision detail UI & shared types
- Agent reasoning loop
- Reply classifier & poll-replies workflow
- LLM provider abstraction (lib/llm.ts)
- TS config (backend)
- shadcn/components.json config
- Menubar UI primitives
- Tool dispatcher & adapter layer
- Recovery ladder & debug toggle
- Gmail adapter & test scripts
- Form/label UI primitives
- Misc npm dependencies
- Dashboard shell/topbar/sidebar
- Overview charts (gauge, trend)
- Dashboard list/detail components & formatters
- Chart UI primitives
- Context menu UI
- Dropdown menu UI
- Table UI
- Data table & decisions list
- Breadcrumb UI
- Drawer UI
- Navigation menu UI
- Select UI
- Card UI
- Toggle group UI
- Pre-commit email scrub scripts
- Alert UI
- Input OTP UI
- Gmail OAuth token flow
- Root layout
- Accordion UI
- Avatar UI
- Sonner toaster
- Git hooks setup script
- npm dependency: clsx
- npm dependency: cmdk
- npm dependency: date fns
- npm dependency: dotenv
- npm dependency: embla carousel react
- npm dependency: google generative ai
- npm dependency: googleapis
- npm dependency: hookform resolvers
- npm dependency: input otp
- npm dependency: motion
- npm dependency: next
- npm dependency: next config
- npm dependency: next env d
- npm dependency: open
- npm dependency: radix ui react accordion
- npm dependency: radix ui react alert dialog
- npm dependency: radix ui react aspect ratio
- npm dependency: radix ui react avatar
- npm dependency: radix ui react checkbox
- npm dependency: radix ui react collapsible
- npm dependency: radix ui react context menu
- npm dependency: radix ui react dialog
- npm dependency: radix ui react dropdown menu
- npm dependency: radix ui react label
- npm dependency: radix ui react menubar
- npm dependency: radix ui react navigation menu
- npm dependency: radix ui react popover
- npm dependency: radix ui react progress
- npm dependency: radix ui react radio group
- npm dependency: radix ui react scroll area
- npm dependency: radix ui react separator
- npm dependency: radix ui react slider
- npm dependency: radix ui react slot
- npm dependency: radix ui react switch
- npm dependency: radix ui react tabs
- npm dependency: radix ui react toggle
- npm dependency: radix ui react tooltip
- npm dependency: react day picker
- npm dependency: react dom
- npm dependency: react hook form
- npm dependency: react resizable panels
- npm dependency: recharts
- npm dependency: sonner
- npm dependency: supabase supabase js
- npm dependency: tailwind merge
- npm dependency: tailwindcss
- npm dependency: tw animate css
- npm dependency: vaul
- npm dependency: zod
- CLAUDE.md — The One Rule
- Next.js framework node

## God Nodes (most connected - your core abstractions)

1. `cn()` - 99 edges
2. `compilerOptions` - 17 edges
3. `dispatchTool()` - 17 edges
4. `getDecisions()` - 15 edges
5. `File ownership table` - 15 edges
6. `recordOutcome()` - 11 edges
7. `getInvoices()` - 11 edges
8. `Decision` - 11 edges
9. `seedInvoices` - 10 edges
10. `compilerOptions` - 10 edges

## Surprising Connections (you probably didn't know these)

- `README human-in-the-loop description: send_reminder_email pre-approved only, else ask_human` --semantically_similar_to--> `Human-in-the-loop split (gated vs autonomous actions)` [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Provider boundary: only lib/llm.ts imports @google/generative-ai` --semantically_similar_to--> `Provider abstraction over LLM vendor (lib/llm.ts)` [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Loop actively detects fake tool use (text-narrated tool name) and nudges model to take a real action` --semantically_similar_to--> `Rule 1: Real function calling only` [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `README manualProcedure description: teaches reasoning, not a call log` --semantically_similar_to--> `Rule 3: Every decision carries manualProcedure: string[]` [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Avoid rewriting published git history (no force-push/rebase/amend/squash) to keep Lovable sync intact` --semantically_similar_to--> `Git workflow rule: Claude Code must not commit/push without explicit instruction` [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Five tool categories implement one shared adapter interface** — claude_five_tool_categories, claude_accounting_tool, claude_email_tool, claude_payments_tool, claude_crm_tool, claude_calendar_sms_tool [EXTRACTED 1.00]
- **Seeded scenarios each prove one distinct autonomous-reasoning behaviour** — scenario_loyal_payer, scenario_promise_breaker, scenario_open_renewal, scenario_reconciliation_short_payment, scenario_low_confidence [EXTRACTED 1.00]
- **robots.txt crawler allowlist policy** — public_robots_googlebot, public_robots_bingbot, public_robots_twitterbot, public_robots_facebookexternalhit, public_robots_wildcard [EXTRACTED 1.00]

## Communities (99 total, 54 thin omitted)

### Community 0 - "Marketing pages & feature dialogs"

Cohesion: 0.05
Nodes (41): autonomous, FeaturePage(), FEATURES, gated, generateMetadata(), isSlug(), ladder, scenarios (+33 more)

### Community 1 - "Dashboard pages & persistence layer"

Cohesion: 0.07
Nodes (37): app/** (Next.js dashboard, approval queue, audit trail, teach-me panel), submitHumanAction(), ApprovalsPage(), metadata, DecisionDetailPage(), DecisionsPage(), metadata, metadata (+29 more)

### Community 2 - "React carousel/sidebar UI primitives"

Cohesion: 0.06
Nodes (39): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+31 more)

### Community 3 - "Sidebar & sheet UI primitives"

Cohesion: 0.05
Nodes (38): Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+30 more)

### Community 4 - "Package tooling & lint config"

Cohesion: 0.05
Nodes (43): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies (+35 more)

### Community 5 - "Locked architecture docs (CLAUDE.md/README)"

Cohesion: 0.05
Nodes (41): Avoid rewriting published git history (no force-push/rebase/amend/squash) to keep Lovable sync intact, Lovable (connected external platform, lovable.dev), Accounting tool category (QuickBooks/Xero, simulated), Calendar + SMS tool category (Google Cal/Twilio/Ideamart, simulated), CRM tool category (HubSpot/Zoho, simulated), Decisions and Why (Supabase, Gemini, Gmail, manualProcedure, code freeze rationale), Email tool category (Gmail/Outlook, LIVE), Error recovery ladder (retry, fallback, degrade, escalate) (+33 more)

### Community 6 - "TS config (frontend)"

Cohesion: 0.05
Nodes (37): app/**/\*.ts, app/**/_.tsx, components/\**/_.ts, components/**/\*.tsx, DOM, DOM.Iterable, ES2022, hooks/**/*.ts (+29 more)

### Community 7 - "Misc shadcn UI primitives"

Cohesion: 0.09
Nodes (20): Badge(), BadgeProps, badgeVariants, Checkbox, HoverCardContent, PopoverContent, Progress, RadioGroup (+12 more)

### Community 8 - "Decision detail UI & shared types"

Cohesion: 0.13
Nodes (20): actions, OverviewTab(), parseEscalation(), TABS, PageTransition(), Toggle(), ConfidenceMeter(), ProgressBar() (+12 more)

### Community 9 - "Agent reasoning loop"

Cohesion: 0.16
Nodes (23): buildStubDecision(), buildTurnBudgetEscalation(), deriveStatus(), dispatchWithRecovery(), finalizeDecision(), getPriorOutcomesText(), main(), printDecision() (+15 more)

### Community 10 - "Reply classifier & poll-replies workflow"

Cohesion: 0.14
Nodes (19): classifyReply(), parseClassification(), ReplyClassification, validCategories, blockedEmail, blockedSms, escalation, evidence (+11 more)

### Community 11 - "LLM provider abstraction (lib/llm.ts)"

Cohesion: 0.14
Nodes (20): Provider abstraction over LLM vendor (lib/llm.ts), DECISION_SCHEMA, DecisionOutput, extractSystemText(), generateDecision(), generateWithTools(), getClient(), JsonSchemaType (+12 more)

### Community 12 - "TS config (backend)"

Cohesion: 0.10
Nodes (20): app, components, compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir (+12 more)

### Community 13 - "shadcn/components.json config"

Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 14 - "Menubar UI primitives"

Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 15 - "Tool dispatcher & adapter layer"

Cohesion: 0.23
Nodes (10): blockIfDisputed(), dispatchTool(), TOOLS, getDisputeEvidence(), getInvoiceDetails(), scheduleFollowup(), getCustomerHistory(), getPaymentTransactions() (+2 more)

### Community 16 - "Recovery ladder & debug toggle"

Cohesion: 0.28
Nodes (11): checkForcedFailure(), forceToolFailure(), shouldForceFailure(), recordOutcome(), RecoveryOptions, RecoveryResult, withRecovery(), saveTrailStep() (+3 more)

### Community 17 - "Gmail adapter & test scripts"

Cohesion: 0.27
Nodes (9): seedInvoices, getGmailClient(), IGNORED_SENDER_PATTERNS, isSystemSender(), pollReplies(), sendEmail(), main(), main() (+1 more)

### Community 18 - "Form/label UI primitives"

Cohesion: 0.15
Nodes (11): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+3 more)

### Community 19 - "Misc npm dependencies"

Cohesion: 0.15
Nodes (13): class-variance-authority, express, lucide-react, dependencies, class-variance-authority, express, lucide-react, @radix-ui/react-hover-card (+5 more)

### Community 20 - "Dashboard shell/topbar/sidebar"

Cohesion: 0.24
Nodes (6): DashboardSidebar(), DashboardTopbar(), navItems, AvatarCircle(), sizeMap, NotificationBell()

### Community 21 - "Overview charts (gauge, trend)"

Cohesion: 0.27
Nodes (6): GaugeChart(), OverdueTrendChart(), overdueTrend, KpiCard(), StaggerGrid(), StaggerItem()

### Community 22 - "Dashboard list/detail components & formatters"

Cohesion: 0.27
Nodes (7): ApprovalsQueue(), DecisionDetail(), TrailTab(), DecisionsList(), OverviewPanel(), formatDateTime(), usd()

### Community 23 - "Chart UI primitives"

Cohesion: 0.20
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 24 - "Context menu UI"

Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 25 - "Dropdown menu UI"

Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 26 - "Table UI"

Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 27 - "Data table & decisions list"

Cohesion: 0.39
Nodes (5): filters, DataCell(), DataRow(), DataTable(), Pagination()

### Community 28 - "Breadcrumb UI"

Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 29 - "Drawer UI"

Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 30 - "Navigation menu UI"

Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 31 - "Select UI"

Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 32 - "Card UI"

Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 33 - "Toggle group UI"

Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 34 - "Pre-commit email scrub scripts"

Cohesion: 0.67
Nodes (4): main(), readStdin(), scrubSeedEmails(), selfCheck()

### Community 35 - "Alert UI"

Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 36 - "Input OTP UI"

Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 37 - "Gmail OAuth token flow"

Cohesion: 0.40
Nodes (3): credentials, oAuth2Client, SCOPES

### Community 39 - "Accordion UI"

Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 40 - "Avatar UI"

Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

## Knowledge Gaps

- **403 isolated node(s):** `trail`, `escalation`, `evidence`, `blockedEmail`, `blockedSms` (+398 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Misc shadcn UI primitives` to `Marketing pages & feature dialogs`, `React carousel/sidebar UI primitives`, `Sidebar & sheet UI primitives`, `Decision detail UI & shared types`, `Menubar UI primitives`, `Form/label UI primitives`, `Dashboard shell/topbar/sidebar`, `Overview charts (gauge, trend)`, `Dashboard list/detail components & formatters`, `Chart UI primitives`, `Context menu UI`, `Dropdown menu UI`, `Table UI`, `Data table & decisions list`, `Breadcrumb UI`, `Drawer UI`, `Navigation menu UI`, `Select UI`, `Card UI`, `Toggle group UI`, `Alert UI`, `Input OTP UI`, `Accordion UI`, `Avatar UI`?**
  _High betweenness centrality (0.406) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Misc npm dependencies` to `React carousel/sidebar UI primitives`, `Package tooling & lint config`, `npm dependency: clsx`, `npm dependency: cmdk`, `npm dependency: date fns`, `npm dependency: dotenv`, `npm dependency: embla carousel react`, `npm dependency: google generative ai`, `npm dependency: googleapis`, `npm dependency: hookform resolvers`, `npm dependency: input otp`, `npm dependency: motion`, `npm dependency: next`, `npm dependency: open`, `npm dependency: radix ui react accordion`, `npm dependency: radix ui react alert dialog`, `npm dependency: radix ui react aspect ratio`, `npm dependency: radix ui react avatar`, `npm dependency: radix ui react checkbox`, `npm dependency: radix ui react collapsible`, `npm dependency: radix ui react context menu`, `npm dependency: radix ui react dialog`, `npm dependency: radix ui react dropdown menu`, `npm dependency: radix ui react label`, `npm dependency: radix ui react menubar`, `npm dependency: radix ui react navigation menu`, `npm dependency: radix ui react popover`, `npm dependency: radix ui react progress`, `npm dependency: radix ui react radio group`, `npm dependency: radix ui react scroll area`, `npm dependency: radix ui react separator`, `npm dependency: radix ui react slider`, `npm dependency: radix ui react slot`, `npm dependency: radix ui react switch`, `npm dependency: radix ui react tabs`, `npm dependency: radix ui react toggle`, `npm dependency: radix ui react tooltip`, `npm dependency: react day picker`, `npm dependency: react dom`, `npm dependency: react hook form`, `npm dependency: react resizable panels`, `npm dependency: recharts`, `npm dependency: sonner`, `npm dependency: supabase supabase js`, `npm dependency: tailwind merge`, `npm dependency: tailwindcss`, `npm dependency: tw animate css`, `npm dependency: vaul`, `npm dependency: zod`?**
  _High betweenness centrality (0.274) - this node is a cross-community bridge._
- **Why does `react` connect `React carousel/sidebar UI primitives` to `Misc npm dependencies`, `Sidebar & sheet UI primitives`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **What connects `trail`, `escalation`, `evidence` to the rest of the system?**
  _403 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Marketing pages & feature dialogs` be split into smaller, more focused modules?**
  _Cohesion score 0.05224963715529753 - nodes in this community are weakly interconnected._
- **Should `Dashboard pages & persistence layer` be split into smaller, more focused modules?**
  _Cohesion score 0.06823529411764706 - nodes in this community are weakly interconnected._
- **Should `React carousel/sidebar UI primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.056025369978858354 - nodes in this community are weakly interconnected._
