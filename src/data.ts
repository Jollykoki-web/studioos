/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, ProductStrategy, TeamStructure, WorkflowPhase, Deliverable, QualityGate, AIHandoff, RiskItem } from "./types";

// Seed Project: DevEx Payment Gateway
const seedStrategy1: ProductStrategy = {
  vision: "To render standard cross-border B2B payouts as fast, programmatically trivial, and costless as sending an email.",
  mission: "Equip modern platforms with high-throughput API terminals that bridge regional banking wires directly to global USD liquidity pools.",
  uniqueValueProp: "Zero-latency developer-led payments orchestrator via stateless transaction endpoints, bypassing traditional card interchange overhead.",
  strategicPillars: [
    {
      title: "Stateless Transaction Routing",
      explanation: "Remove local database query requirements for core checkout triggers by secure inline token signature passing."
    },
    {
      title: "Stateless Multi-Currency Ledger",
      explanation: "Synchronize accounting and float variables on distributed ledger logs, guaranteeing sub-cent balance integrity globally."
    },
    {
      title: "Stateless Webhooks",
      explanation: "Provide absolute delivery guarantees through decentralized retry workers running on Vercel Edge Middleware."
    },
    {
      title: "Developer Experience First",
      explanation: "Interactive sandbox terminals, instant key provisioning, and code-generated native SDKs for all backend architectures."
    }
  ],
  positioningMatrix: {
    axisX: "Stripe Console (Heavy / Legacy) <-- DevEx API TERMINAL --> Direct Adyen (Custom/Complex)",
    axisY: "Local Testing Core <-- DevEx LEDGER NETWORK --> Multi-bank Clearing Networks",
    notes: "StudioOS designed this strategy to conquer B2B payout friction by isolating compliance risks to decentralized liquidity nodes of the infrastructure."
  }
};

const seedTeam1: TeamStructure = {
  teamName: "Core Payouts Crew",
  roles: [
    {
      id: "role_1",
      title: "Principal API Architect",
      count: 1,
      responsibilities: [
        "Maintain sub-millisecond route latency endpoints.",
        "Govern security definitions of transaction signature tokens.",
        "Compose JSON-schema standards for API callbacks."
      ],
      tools: ["Linear", "Bun", "TypeScript", "Vercel", "Langfuse", "Pulumi"],
      vibe: "Obsessive about network latency, type safety, and clean RFC specs."
    },
    {
      id: "role_2",
      title: "Senior Security Specialist",
      count: 1,
      responsibilities: [
        "Audit cryptographic signatures of cross-border transfers.",
        "Implement real-time transaction laundering analytics handlers.",
        "Maintain HSM integrations for ledger key pools."
      ],
      tools: ["Rust", "Vault", "Sentry", "PostgreSQL", "Linear"],
      vibe: "Zero trust, absolute rigor, and continuous penetration simulations."
    },
    {
      id: "role_3",
      title: "Edge Delivery Architect",
      count: 1,
      responsibilities: [
        "Orchestrate geo-distributed Vercel Edge servers.",
        "Maintain global state caches with Cloudflare Durable Objects.",
        "Polish real-time dashboard terminal React interface."
      ],
      tools: ["TailwindCSS", "React CSS", "Cypress", "Vite", "Framer Motion"],
      vibe: "UI craftsmanship, sub-frame animation response, and pure client state."
    }
  ],
  workflowRule: "Dual-Signoff Required. Code deployments require both Architecture and Security checklist validations.",
  synergyNotes: "API Architect outlines endpoint models; Security Architect attaches key validation middleware; Edge Architect maps browser interface integrations."
};

const seedWorkflow1: WorkflowPhase[] = [
  {
    id: "wf_1",
    phaseName: "Core API Contract",
    description: "Publish stateless transaction schemas and verify client routing contracts.",
    input: "User payment flow diagram and target bank connectivity criteria.",
    process: "Draft exact OpenAPI 3.1 specification, run continuous contract testing, and synthesize mocked backend server targets.",
    output: "Valid OpenAPI scheme schema, mock API sandbox endpoint, and test payload runners.",
    timelineEstimate: "Days 1 to 4 (Sprint 1)"
  },
  {
    id: "wf_2",
    phaseName: "Cryptographic Integration",
    description: "Integrate stateless ledger signature validation middleware.",
    input: "Mock API sandbox and private HSM key token algorithms.",
    process: "Compile transaction signature validators, create HSM cluster test nodes, and benchmark transaction latency under load.",
    output: "Tested middleware modules, HSM verification logs, and benchmark reports.",
    timelineEstimate: "Days 5 to 10 (Sprint 1)"
  },
  {
    id: "wf_3",
    phaseName: "Web Dashboard Hookup",
    description: "Build developer sandbox terminal app for instant api testing and transaction logs.",
    input: "Secured transaction API and analytics pipeline endpoints.",
    process: "Construct React UI layouts, deploy serverless socket listeners, and bind local event dispatchers.",
    output: "Fully functional Vite-powered React client dashboard with interactive transaction timelines.",
    timelineEstimate: "Days 11 to 20 (Sprint 2)"
  }
];

const seedDeliverables1: Deliverable[] = [
  {
    id: "del_1",
    name: "Stateless Core Router Spec",
    category: "code",
    format: "OpenAPI 3.1 JSON / YAML Spec",
    assignee: "Principal API Architect",
    description: "Defines clean payload standards for instant cross-border B2B payout requests.",
    steps: [
      "Detail currency exchange markup parameters.",
      "Incorporate transaction idempotency keys in headers.",
      "Verify structure matches target multi-currency ledger models."
    ]
  },
  {
    id: "del_2",
    name: "Cryptographic Middleware Suite",
    category: "infrastructure",
    format: "Stateless Node/Rust Middleware NPM Package",
    assignee: "Senior Security Specialist",
    description: "A pluggable edge validation suite that checks signature headers against HSM keys under 2ms.",
    steps: [
      "Implement ECDSA verification schemas.",
      "Add replay-attack guards via stateless cache checks.",
      "Write secure error exception logs that prevent token detail leaks."
    ]
  },
  {
    id: "del_3",
    name: "Developer Control Terminal UI",
    category: "design",
    format: "Tailwind React Application Frontend",
    assignee: "Edge Delivery Architect",
    description: "The primary graphical dashboard for platform customers to view logs, rotate API keys, and test transfers.",
    steps: [
      "Incorporate JetBrains Mono font variables for payment telemetry streams.",
      "Build live-updating websocket transaction ticker.",
      "Attach custom key creation wizard with responsive layout."
    ]
  }
];

const seedQualityGates1: QualityGate[] = [
  {
    id: "qg_1",
    phase: "Core API Contract",
    criteria: [
      "Zero validation exceptions under custom contract tests.",
      "OpenAPI spec outputs 100% compliant JSON structures."
    ],
    gatekeepers: ["Principal API Architect"],
    remediationPath: "Regenerate Swagger contracts, run automated validation engine, and patch payload definition bugs."
  },
  {
    id: "qg_2",
    phase: "Cryptographic Integration",
    criteria: [
      "HSM decryption validation adds less than 3.5ms delay.",
      "No secret keys exposed in system log files."
    ],
    gatekeepers: ["Senior Security Specialist", "Principal API Architect"],
    remediationPath: "Inspect decryption algorithm caches, optimize crypto routines, and scrub logging targets of dynamic variables."
  }
];

const seedAIHandoffs1: AIHandoff[] = [
  {
    id: "ah_1",
    taskName: "Auto-Generate SDK Bindings",
    targetAI: "Gemini 3.5 Flash for System Copywritting",
    contextRequired: ["Core API contract file", "OpenAPI 3.1 JSON schema spec"],
    promptTemplate: `You are an elite SDK compiler agent. Read the provided OpenAPI JSON specification and generate a completely type-safe TypeScript library client for node and browser.
Ensure all endpoints are fully mapped, including error-catching models and interactive code documentation comments for every param.

API Schema JSON:
[PASTE OPENAPI SCHEMA HERE]`,
    expectedOutputFormat: "Pure TypeScript source code file (client.ts)",
    instructions: "Feed this output directly into the build pipeline and test via type checking."
  },
  {
    id: "ah_2",
    taskName: "Write Cryptographic Security Asserts",
    targetAI: "Cursor IDE / Copilot",
    contextRequired: ["HSM schema token", "Middleware signing spec"],
    promptTemplate: `Review our cryptographic signature handler and write 20 hard-hitting vitest testing asserts checking for:
- Invalid ECDSA curves
- Missing header authentication tokens
- ID-based signature injections
- Replay attacks using identical payloads within 60s window.

Middleware source code:
[PASTE MIDDLEWARE CODE HERE]`,
    expectedOutputFormat: "Javascript unit test script (security.test.ts)",
    instructions: "Run this test script locally inside sandbox nodes and verify no unexpected outputs are permitted."
  }
];

const seedRisks1: RiskItem[] = [
  {
    id: "risk_1",
    category: "technical",
    description: "Regional bank routing gateways experience recurring websocket dropouts.",
    likelihood: "High",
    impact: "High",
    mitigation: "Implement a highly resilient offline-queue fallback mechanism using Cloudflare Durable Objects to retry transfers within milliseconds."
  },
  {
    id: "risk_2",
    category: "product",
    description: "Target enterprise customers demand legacy SOAP layouts or custom bulk formats rather than JSON APIs.",
    likelihood: "Medium",
    impact: "Medium",
    mitigation: "Deploy a proxy middleware transformer at the Edge that translates SOAP payload structures into clean OpenAPI-compliant JSON objects automatically."
  },
  {
    id: "risk_3",
    category: "adoption",
    description: "Extreme developer drop-off during onboarding due to compliance / KYC friction delays.",
    likelihood: "High",
    impact: "High",
    mitigation: "Launch a 'Simulated Live Sandbox Mode' allowing devs to verify integrations with fictitious profiles while the real business checks complete in parallel background."
  }
];

export const INITIAL_SEEDED_PROJECTS: Project[] = [
  {
    id: "dev-pay-01",
    name: "DevEx Payment Gateway",
    description: "A stateless, cross-border payments ledger and developer dashboard for high-throughput SaaS payouts, resolving traditional multi-bank clearing latency issues.",
    targetAudience: "Indie hackers, developer tool founders, and global platform finance teams.",
    createdAt: "2026-06-21T09:00:00Z",
    strategy: seedStrategy1,
    team: seedTeam1,
    workflow: seedWorkflow1,
    deliverables: seedDeliverables1,
    qualityGates: seedQualityGates1,
    aiHandoffs: seedAIHandoffs1,
    risks: seedRisks1
  },
  {
    id: "flow-note-02",
    name: "FlowNote Keyboard IDE",
    description: "A blazing fast, offline-first notes engine tailored for developers and technical builders, featuring instant nested folder schema mappings, semantic hotkeys, and markdown compiling.",
    targetAudience: "Developers, software engineers, technical researchers, and keyboard-maximalists.",
    createdAt: "2026-06-20T14:30:00Z",
    strategy: {
      vision: "To replace complex web text editors with a keyboard-driven local markdown canvas that boots in 1ms.",
      mission: "Offer standard technical writers a gorgeous, distraction-free environment utilizing purely offline files and instant search indexing capabilities.",
      uniqueValueProp: "Zero-latency technical knowledge graph fully controllable via keyboard chords, bypassing standard web database loading steps.",
      strategicPillars: [
        { title: "Hotkeys First Design", explanation: "All commands, file nesting, search matrices, and layout splits are accessible via key chords." },
        { title: "Local First SQLite Core", explanation: "Database state runs directly inside WebAssembly on the client, syncing with offline file volumes." },
        { title: "Visual Node Visualizer", explanation: "Build real-time interactive interactive layout graphs mapping notes to core development tasks." },
        { title: "Clean Elegant Typography", explanation: "Utilize beautiful space proportions, subtle typography pairing, and rich negative space." }
      ],
      positioningMatrix: {
        axisX: "Obsidian (Plugins required / Heavy) <-- FLOWNOTE --> Notion (Web-locked / Slow)",
        axisY: "Local File System Only <-- HYBRID WASM SYNC --> Remote Databases",
        notes: "StudioOS engineered this notes engine as a pure client IDE that respects mechanical keyboard workflows and speeds up software design iterations."
      }
    },
    team: {
      teamName: "FlowNote Artisans",
      roles: [
        {
          id: "fn_role_1",
          title: "Lead Frontend Systems Engineer",
          count: 1,
          responsibilities: ["Optimise WebAssembly SQLite core performance.", "Maintain lag-free layout splits.", "Handle custom keyboard layouts."],
          tools: ["Vite", "WebAssembly", "TypeScript", "TailwindCSS"],
          vibe: "Scythe-sharp focus on desktop rendering performance and frame rate limits."
        },
        {
          id: "fn_role_2",
          title: "Staff Designer",
          count: 1,
          responsibilities: ["Govern the visual spacing, border metrics, and dark style templates.", "Create clean typography rules."],
          tools: ["Figma", "CSS Variables", "TailwindCSS"],
          vibe: "Striving for Swiss minimalism, visual symmetry, and calming eye-comfort colors."
        }
      ],
      workflowRule: "Simplicity First. No features are added without verifying they require fewer than 3 mouse interactions.",
      synergyNotes: "System Engineer optimizes rendering thread speed; Staff Designer tests responsive visual spacing rules on high DPI displays."
    },
    workflow: [
      { id: "fn_wf_1", phaseName: "WASM Engine Setup", description: "Bootstrap SQLite compilation to WASM.", input: "WASM SQLite binaries", process: "Wrap database queries in reactive state hooks", output: "Local sync engine module", timelineEstimate: "Days 1-5" },
      { id: "fn_wf_2", phaseName: "Minimalist Editor Layout", description: "Design a fully fluid text editor component.", input: "Editor schemas", process: "Implement line numbers and Markdown parsing rendering engines", output: "Complete React Editor panel", timelineEstimate: "Days 6-12" }
    ],
    deliverables: [
      { id: "fn_del_1", name: "High-Performance WASM Hook", category: "code", format: "React Hook (useWasmDatabase)", assignee: "Lead Frontend Systems Engineer", description: "Enables instant local note query indexing directly via browser memory buffers.", steps: ["Compile SQLite WASM code", "Prepare table migrations", "Attach indexing logic"] }
    ],
    qualityGates: [
      { id: "fn_qg_1", phase: "WASM Engine Setup", criteria: ["Boot time is strictly under 15ms", "No lost storage writes on memory reset"], gatekeepers: ["Lead Frontend Systems Engineer"], remediationPath: "Review Web Worker cache settings and strip unnecessary code modules." }
    ],
    aiHandoffs: [
      { id: "fn_ah_1", taskName: "Auto-Generate Layout Themes", targetAI: "Cursor IDE", contextRequired: ["Tailwind config", "Main CSS variables"], promptTemplate: "Please build 5 dark-palette themes matching Obsidian styles.\nPalette definitions:\n[PASTE CSS VARIABLES]", expectedOutputFormat: "Pure Tailwind theme map", instructions: "Merge into global settings array." }
    ],
    risks: [
      { id: "fn_risk_1", category: "technical", description: "Browser sandbox storage gets cleared during operating system memory sweeps.", likelihood: "Medium", impact: "High", mitigation: "Enforce persistent memory requests from browser context and offer live self-hosted sync folders." }
    ]
  }
];

// Helper to convert Project to clean, highly-readable Markdown
export function exportToMarkdown(project: Project): string {
  if (!project) return "";
  
  let md = `# STUDIOOS PRODUCT OPERATING SYSTEM (PRODUCT OS)
## ${project.name.toUpperCase()}

> **Product Concept**: ${project.description}
> **Target Audience**: ${project.targetAudience}
> **Generated on**: ${new Date(project.createdAt).toLocaleDateString()}

=========================================

### PHASE 1: PRODUCT STRATEGY

#### 1.1 Vision Statement
${project.strategy?.vision || "No vision generated."}

#### 1.2 Mission Statement
${project.strategy?.mission || "No mission generated."}

#### 1.3 Unique Value Proposition
${project.strategy?.uniqueValueProp || "No UVP generated."}

#### 1.4 Strategic Pillars
${project.strategy?.strategicPillars?.map((p, idx) => `
**Pillar ${idx + 1}: ${p.title}**
_Explanation_: ${p.explanation}
`).join("\n") || "No Pillars generated."}

#### 1.5 Positioning Matrix & Competitive Notes
* **Axis X**: ${project.strategy?.positioningMatrix?.axisX || ""}
* **Axis Y**: ${project.strategy?.positioningMatrix?.axisY || ""}
* **Analysis Notes**: 
${project.strategy?.positioningMatrix?.notes || ""}

=========================================

### PHASE 2: TEAM MONIKER & STRUCTURE
Team Code Name: **${project.team?.teamName || "Not generated"}**

#### 2.1 Core Role Allocations
${project.team?.roles?.map((r, idx) => `
**Role ${idx + 1}: ${r.title}** (Qty: ${r.count})
* _Responsibilities_:
${r.responsibilities.map(resp => `  - ${resp}`).join("\n")}
* _Operational Stack_: ${r.tools.join(", ")}
* _Execution Vibe_: ${r.vibe}
`).join("\n") || "No team roles mapped."}

#### 2.2 Operational Protocols & Workflow Rules
* **Strict Rule**: ${project.team?.workflowRule || "No workflow rules specified."}
* **Synergy Blueprint**: ${project.team?.synergyNotes || "No synergy notes available."}

=========================================

### PHASE 3: EXECUTION WORKFLOW PHASES
${project.workflow?.map((w, idx) => `
#### Phase ${idx + 1}: ${w.phaseName} (${w.timelineEstimate})
* **Objective**: ${w.description}
* **Starting Inputs**: ${w.input}
* **Active Engineering Process**: ${w.process}
* **Verifiable Phase Output**: ${w.output}
`).join("\n") || "No execution phases mapped."}

=========================================

### PHASE 4: ACTIONABLE DEVELOPER DELIVERABLES
${project.deliverables?.map((d, idx) => `
#### Deliverable ${idx + 1}: [${d.category.toUpperCase()}] ${d.name}
* **Spec Output Format**: ${d.format}
* **Assigned Team Member**: ${d.assignee}
* **Technical Overview**: ${d.description}
* **Construction Steps**:
${d.steps.map((st, sIdx) => `  ${sIdx + 1}. ${st}`).join("\n")}
`).join("\n") || "No deliverables listed."}

=========================================

### PHASE 5: QUALITY GATES & REMEDIATION PATHS
${project.qualityGates?.map((q, idx) => `
#### Quality Gate ${idx + 1}: Validation for "${q.phase}"
* **Verification Checklist**:
${q.criteria.map(crit => `  [ ] ${crit}`).join("\n")}
* **Responsible Gatekeepers**: ${q.gatekeepers.join(", ")}
* **Remediation Plan**: _${q.remediationPath}_
`).join("\n") || "No Quality Gates established."}

=========================================

### PHASE 6: CUSTOM AI HANDOFFS (COPY-PASTE READY)
${project.aiHandoffs?.map((a, idx) => `
#### AI Task Handoff ${idx + 1}: ${a.taskName}
* **Dedicated AI**: ${a.targetAI}
* **Required Context Files**: ${a.contextRequired.join(", ")}
* **Target Output Standard**: ${a.expectedOutputFormat}
* **Prompt Instructions**: ${a.instructions}

--- START OF COPY-PASTE PROMPT ---
${a.promptTemplate}
--- END OF COPY-PASTE PROMPT ---
`).join("\n") || "No AI Handoff Prompts specified."}

=========================================

### PHASE 7: RISKS & SYSTEM DE-BOTTLENECKING
${project.risks?.map((risk, idx) => `
#### Risk ${idx + 1}: [${risk.category.toUpperCase()}] (${risk.likelihood} Likelihood / ${risk.impact} Impact)
* **BottleNeck Description**: ${risk.description}
* **Mitigation Protocol**: _${risk.mitigation}_
`).join("\n") || "No active risks analyzed."}

=========================================
Generated strictly via StudioOS AI System Generator.
`;
  return md;
}

// ─── Per-user localStorage isolation ───────────────────────────────────────
// Each signed-in user gets their own scoped key so that switching Google
// accounts on the same browser never leaks data between users.
// Unauthenticated (guest) sessions use the legacy key and see seeded demos.
const LEGACY_STORAGE_KEY = "studio_os_projects";

export function getStorageKey(userId?: string | null): string {
  return userId ? `studio_os_projects_${userId}` : LEGACY_STORAGE_KEY;
}

/** Remove a user's localStorage cache (called on logout). */
export function clearUserStorage(userId: string): void {
  try {
    localStorage.removeItem(getStorageKey(userId));
  } catch (_) {}
}

export function loadStoredProjects(userId?: string | null): Project[] {
  try {
    const key = getStorageKey(userId);
    const value = localStorage.getItem(key);
    if (!value) {
      return [];
    }
    const parsed = JSON.parse(value) as Project[];
    // Clean up older caches where templates might have been merged into guest or user storage
    const templateIds = new Set(INITIAL_SEEDED_PROJECTS.map(p => p.id));
    return parsed.filter(p => !templateIds.has(p.id));
  } catch (error) {
    console.error("Local storage load failed", error);
    return [];
  }
}

export function saveProjectToStorage(project: Project, userId?: string | null): Project[] {
  try {
    const key = getStorageKey(userId);
    const currentList = loadStoredProjects(userId);
    // Prepend or replace if it already exists
    const withoutProject = currentList.filter(p => p.id !== project.id);
    const newList = [project, ...withoutProject];
    localStorage.setItem(key, JSON.stringify(newList));
    return newList;
  } catch (error) {
    return [];
  }
}

export function deleteProjectFromStorage(id: string, userId?: string | null): Project[] {
  try {
    const key = getStorageKey(userId);
    const currentList = loadStoredProjects(userId);
    const newList = currentList.filter(p => p.id !== id);
    localStorage.setItem(key, JSON.stringify(newList));
    return newList;
  } catch (error) {
    return [];
  }
}
