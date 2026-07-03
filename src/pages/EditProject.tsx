import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp,
  Edit3, AlertTriangle, CheckCircle, Loader2, X, GripVertical
} from "lucide-react";
import {
  Project, ProductStrategy, TeamRole, WorkflowPhase,
  Deliverable, QualityGate, AIHandoff, RiskItem
} from "../types";
import { Button } from "../components/ui/Button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditProjectProps {
  project: Project;
  pageTransition: Record<string, unknown>;
  onSave: (updated: Project) => Promise<void>;
  onCancel: () => void;
}

type EditorTab =
  | "overview"
  | "strategy"
  | "team"
  | "workflow"
  | "deliverables"
  | "gates"
  | "handoffs"
  | "risks";

const EDITOR_TABS: { id: EditorTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "strategy", label: "Strategy" },
  { id: "team", label: "Team" },
  { id: "workflow", label: "Workflow" },
  { id: "deliverables", label: "Deliverables" },
  { id: "gates", label: "Quality Gates" },
  { id: "handoffs", label: "AI Handoffs" },
  { id: "risks", label: "Risks" },
];

// ─── Shared sub-components ──────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}
const Field = ({ label, required, children, hint }: FieldProps) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-[var(--text-primary)] tracking-tight">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-[var(--text-tertiary)]">{hint}</p>}
  </div>
);

const fieldCls = "w-full rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-disabled)] px-3 py-2.5 focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] transition-all";

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden ${className}`}>
    {children}
  </div>
);

interface ExpandableItemProps {
  summary: React.ReactNode;
  editor: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
}
const ExpandableItem = ({ summary, editor, onDelete, deleteLabel = "Delete" }: ExpandableItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center gap-2 text-left min-w-0 focus:outline-none group"
        >
          {summary}
          <span className="ml-auto flex-shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="ml-2 flex-shrink-0 p-1.5 rounded-md text-[var(--text-disabled)] hover:text-red-400 hover:bg-red-500/10 transition-all"
          title={deleteLabel}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="editor"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-4 pb-4 pt-1 border-t border-[var(--border-subtle)] space-y-3 bg-[var(--bg-surface-hover)]">
              {editor}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AddButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-surface-hover)] transition-all"
  >
    <Plus className="w-3.5 h-3.5" /> {label}
  </button>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${fieldCls} ${props.className ?? ""}`} />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`${fieldCls} resize-none ${props.className ?? ""}`} />
);

// Comma-separated array helper
const arrayToText = (arr: string[] | undefined) => (arr ?? []).join(", ");
const textToArray = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

// ─── Section Editors ─────────────────────────────────────────────────────────

const OverviewEditor = ({
  draft,
  update,
}: {
  draft: Project;
  update: (key: keyof Project, value: unknown) => void;
}) => (
  <div className="space-y-5">
    <Field label="Project Name" required>
      <TextInput
        value={draft.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="e.g. Acme Billing Dashboard"
      />
    </Field>
    <Field label="Architecture Description" required>
      <TextArea
        rows={4}
        value={draft.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="Describe the technical requirements and business logic…"
      />
    </Field>
    <Field label="Target Persona">
      <TextInput
        value={draft.targetAudience}
        onChange={(e) => update("targetAudience", e.target.value)}
        placeholder="e.g. Enterprise DevOps Teams"
      />
    </Field>
  </div>
);

const StrategyEditor = ({
  strategy,
  onChange,
}: {
  strategy: NonNullable<Project["strategy"]>;
  onChange: (s: NonNullable<Project["strategy"]>) => void;
}) => {
  const set = <K extends keyof NonNullable<Project["strategy"]>>(k: K, v: NonNullable<Project["strategy"]>[K]) =>
    onChange({ ...strategy, [k]: v });

  const updatePillar = (idx: number, field: "title" | "explanation", value: string) => {
    const pillars = strategy.strategicPillars.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    set("strategicPillars", pillars);
  };

  const addPillar = () =>
    set("strategicPillars", [...strategy.strategicPillars, { title: "", explanation: "" }]);

  const removePillar = (idx: number) =>
    set("strategicPillars", strategy.strategicPillars.filter((_, i) => i !== idx));

  const setMatrix = (k: "axisX" | "axisY" | "notes", v: string) =>
    set("positioningMatrix", { ...strategy.positioningMatrix, [k]: v });

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">Core Statements</p>
        </div>
        <div className="p-4 space-y-4">
          <Field label="Vision">
            <TextArea rows={2} value={strategy.vision} onChange={(e) => set("vision", e.target.value)} placeholder="Long-term aspirational goal…" />
          </Field>
          <Field label="Mission">
            <TextArea rows={2} value={strategy.mission} onChange={(e) => set("mission", e.target.value)} placeholder="How you achieve the vision…" />
          </Field>
          <Field label="Unique Value Proposition">
            <TextArea rows={2} value={strategy.uniqueValueProp} onChange={(e) => set("uniqueValueProp", e.target.value)} placeholder="What makes this irreplaceable…" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">Strategic Pillars</p>
          <span className="text-[10px] text-[var(--text-tertiary)]">{strategy.strategicPillars.length} pillars</span>
        </div>
        <div className="p-4 space-y-2">
          {strategy.strategicPillars.map((pillar, idx) => (
            <ExpandableItem
              key={idx}
              onDelete={() => removePillar(idx)}
              summary={
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {pillar.title || <em className="text-[var(--text-tertiary)]">Untitled pillar</em>}
                </span>
              }
              editor={
                <>
                  <Field label="Title"><TextInput value={pillar.title} onChange={(e) => updatePillar(idx, "title", e.target.value)} placeholder="Pillar name" /></Field>
                  <Field label="Explanation"><TextArea rows={2} value={pillar.explanation} onChange={(e) => updatePillar(idx, "explanation", e.target.value)} placeholder="How this pillar drives the strategy…" /></Field>
                </>
              }
            />
          ))}
          <AddButton onClick={addPillar} label="Add Strategic Pillar" />
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">Positioning Matrix</p>
        </div>
        <div className="p-4 space-y-3">
          <Field label="X-Axis"><TextInput value={strategy.positioningMatrix.axisX} onChange={(e) => setMatrix("axisX", e.target.value)} placeholder="Competitor A ← → Competitor B" /></Field>
          <Field label="Y-Axis"><TextInput value={strategy.positioningMatrix.axisY} onChange={(e) => setMatrix("axisY", e.target.value)} placeholder="Low complexity ← → High complexity" /></Field>
          <Field label="Notes"><TextArea rows={2} value={strategy.positioningMatrix.notes} onChange={(e) => setMatrix("notes", e.target.value)} placeholder="Strategic positioning rationale…" /></Field>
        </div>
      </SectionCard>
    </div>
  );
};

const TeamEditor = ({
  team,
  onChange,
}: {
  team: NonNullable<Project["team"]>;
  onChange: (t: NonNullable<Project["team"]>) => void;
}) => {
  const set = <K extends keyof NonNullable<Project["team"]>>(k: K, v: NonNullable<Project["team"]>[K]) =>
    onChange({ ...team, [k]: v });

  const updateRole = (idx: number, patch: Partial<TeamRole>) =>
    set("roles", team.roles.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const addRole = () =>
    set("roles", [
      ...team.roles,
      { id: crypto.randomUUID(), title: "", count: 1, responsibilities: [], tools: [], vibe: "" },
    ]);

  const removeRole = (idx: number) => set("roles", team.roles.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">Team Identity</p>
        </div>
        <div className="p-4 space-y-4">
          <Field label="Team Name"><TextInput value={team.teamName} onChange={(e) => set("teamName", e.target.value)} placeholder="Core Engineering Squad" /></Field>
          <Field label="Workflow Rule"><TextInput value={team.workflowRule} onChange={(e) => set("workflowRule", e.target.value)} placeholder="e.g. Dual-Signoff Required." /></Field>
          <Field label="Synergy Notes"><TextArea rows={2} value={team.synergyNotes} onChange={(e) => set("synergyNotes", e.target.value)} placeholder="How team members collaborate…" /></Field>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">Roles</p>
          <span className="text-[10px] text-[var(--text-tertiary)]">{team.roles.length} roles</span>
        </div>
        <div className="p-4 space-y-2">
          {team.roles.map((role, idx) => (
            <ExpandableItem
              key={role.id}
              onDelete={() => removeRole(idx)}
              summary={
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">{role.title || <em className="text-[var(--text-tertiary)]">Untitled role</em>}</span>
                  <span className="flex-shrink-0 text-[10px] bg-[var(--bg-surface-active)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded text-[var(--text-secondary)]">×{role.count}</span>
                </div>
              }
              editor={
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Title"><TextInput value={role.title} onChange={(e) => updateRole(idx, { title: e.target.value })} placeholder="Senior Engineer" /></Field>
                    <Field label="Headcount"><TextInput type="number" min={1} value={role.count} onChange={(e) => updateRole(idx, { count: Math.max(1, parseInt(e.target.value) || 1) })} /></Field>
                  </div>
                  <Field label="Vibe / Character"><TextInput value={role.vibe} onChange={(e) => updateRole(idx, { vibe: e.target.value })} placeholder="Obsessive about latency and clean specs." /></Field>
                  <Field label="Responsibilities" hint="One per line"><TextArea rows={3} value={role.responsibilities.join("\n")} onChange={(e) => updateRole(idx, { responsibilities: e.target.value.split("\n") })} placeholder="Maintain sub-ms endpoints.\nGovernance of security tokens." /></Field>
                  <Field label="Tools" hint="Comma-separated"><TextInput value={arrayToText(role.tools)} onChange={(e) => updateRole(idx, { tools: textToArray(e.target.value) })} placeholder="TypeScript, Vercel, Linear" /></Field>
                </>
              }
            />
          ))}
          <AddButton onClick={addRole} label="Add Role" />
        </div>
      </SectionCard>
    </div>
  );
};

const WorkflowEditor = ({
  workflow,
  onChange,
}: {
  workflow: WorkflowPhase[];
  onChange: (w: WorkflowPhase[]) => void;
}) => {
  const update = (idx: number, patch: Partial<WorkflowPhase>) =>
    onChange(workflow.map((p, i) => (i === idx ? { ...p, ...patch } : p)));

  const add = () =>
    onChange([
      ...workflow,
      { id: crypto.randomUUID(), phaseName: "", description: "", input: "", process: "", output: "", timelineEstimate: "" },
    ]);

  const remove = (idx: number) => onChange(workflow.filter((_, i) => i !== idx));

  return (
    <SectionCard>
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">Workflow Phases</p>
        <span className="text-[10px] text-[var(--text-tertiary)]">{workflow.length} phases</span>
      </div>
      <div className="p-4 space-y-2">
        {workflow.map((phase, idx) => (
          <ExpandableItem
            key={phase.id}
            onDelete={() => remove(idx)}
            summary={
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex-shrink-0 w-5 h-5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-active)] text-[10px] font-mono text-[var(--text-secondary)] flex items-center justify-center">{idx + 1}</span>
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">{phase.phaseName || <em className="text-[var(--text-tertiary)]">Untitled phase</em>}</span>
                {phase.timelineEstimate && <span className="flex-shrink-0 text-[10px] text-[var(--text-tertiary)]">{phase.timelineEstimate}</span>}
              </div>
            }
            editor={
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phase Name"><TextInput value={phase.phaseName} onChange={(e) => update(idx, { phaseName: e.target.value })} placeholder="Core API Contract" /></Field>
                  <Field label="Timeline"><TextInput value={phase.timelineEstimate} onChange={(e) => update(idx, { timelineEstimate: e.target.value })} placeholder="Days 1-5" /></Field>
                </div>
                <Field label="Description"><TextArea rows={2} value={phase.description} onChange={(e) => update(idx, { description: e.target.value })} placeholder="What this phase accomplishes…" /></Field>
                <Field label="Input"><TextInput value={phase.input} onChange={(e) => update(idx, { input: e.target.value })} placeholder="What enters this phase…" /></Field>
                <Field label="Process"><TextArea rows={2} value={phase.process} onChange={(e) => update(idx, { process: e.target.value })} placeholder="Steps executed in this phase…" /></Field>
                <Field label="Output"><TextInput value={phase.output} onChange={(e) => update(idx, { output: e.target.value })} placeholder="What this phase produces…" /></Field>
              </>
            }
          />
        ))}
        <AddButton onClick={add} label="Add Workflow Phase" />
      </div>
    </SectionCard>
  );
};

const DeliverablesEditor = ({
  deliverables,
  onChange,
}: {
  deliverables: Deliverable[];
  onChange: (d: Deliverable[]) => void;
}) => {
  const CATEGORIES = ["code", "design", "strategy", "marketing", "infrastructure"] as const;

  const update = (idx: number, patch: Partial<Deliverable>) =>
    onChange(deliverables.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  const add = () =>
    onChange([
      ...deliverables,
      { id: crypto.randomUUID(), name: "", category: "code", format: "", assignee: "", description: "", steps: [] },
    ]);

  const remove = (idx: number) => onChange(deliverables.filter((_, i) => i !== idx));

  return (
    <SectionCard>
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">Deliverables</p>
        <span className="text-[10px] text-[var(--text-tertiary)]">{deliverables.length} items</span>
      </div>
      <div className="p-4 space-y-2">
        {deliverables.map((del, idx) => (
          <ExpandableItem
            key={del.id}
            onDelete={() => remove(idx)}
            summary={
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">{del.name || <em className="text-[var(--text-tertiary)]">Untitled deliverable</em>}</span>
                {del.category && <span className="flex-shrink-0 text-[9px] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded text-[var(--text-tertiary)]">{del.category}</span>}
              </div>
            }
            editor={
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name"><TextInput value={del.name} onChange={(e) => update(idx, { name: e.target.value })} placeholder="SDK Client Library" /></Field>
                  <Field label="Category">
                    <select value={del.category} onChange={(e) => update(idx, { category: e.target.value as Deliverable["category"] })} className={`${fieldCls} h-10`}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Format"><TextInput value={del.format} onChange={(e) => update(idx, { format: e.target.value })} placeholder="TypeScript NPM Package" /></Field>
                  <Field label="Assignee"><TextInput value={del.assignee} onChange={(e) => update(idx, { assignee: e.target.value })} placeholder="Lead Engineer" /></Field>
                </div>
                <Field label="Description"><TextArea rows={2} value={del.description} onChange={(e) => update(idx, { description: e.target.value })} placeholder="What this deliverable accomplishes…" /></Field>
                <Field label="Steps" hint="One per line"><TextArea rows={3} value={del.steps.join("\n")} onChange={(e) => update(idx, { steps: e.target.value.split("\n") })} placeholder="Define endpoints.\nWrite tests.\nPublish package." /></Field>
              </>
            }
          />
        ))}
        <AddButton onClick={add} label="Add Deliverable" />
      </div>
    </SectionCard>
  );
};

const QualityGatesEditor = ({
  gates,
  onChange,
}: {
  gates: QualityGate[];
  onChange: (g: QualityGate[]) => void;
}) => {
  const update = (idx: number, patch: Partial<QualityGate>) =>
    onChange(gates.map((g, i) => (i === idx ? { ...g, ...patch } : g)));

  const add = () =>
    onChange([
      ...gates,
      { id: crypto.randomUUID(), phase: "", criteria: [], gatekeepers: [], remediationPath: "" },
    ]);

  const remove = (idx: number) => onChange(gates.filter((_, i) => i !== idx));

  return (
    <SectionCard>
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">Quality Gates</p>
        <span className="text-[10px] text-[var(--text-tertiary)]">{gates.length} gates</span>
      </div>
      <div className="p-4 space-y-2">
        {gates.map((gate, idx) => (
          <ExpandableItem
            key={gate.id}
            onDelete={() => remove(idx)}
            summary={
              <span className="text-sm font-medium text-[var(--text-primary)] truncate">{gate.phase || <em className="text-[var(--text-tertiary)]">Untitled gate</em>}</span>
            }
            editor={
              <>
                <Field label="Phase Name"><TextInput value={gate.phase} onChange={(e) => update(idx, { phase: e.target.value })} placeholder="Core API Contract" /></Field>
                <Field label="Criteria" hint="One per line"><TextArea rows={3} value={gate.criteria.join("\n")} onChange={(e) => update(idx, { criteria: e.target.value.split("\n") })} placeholder="Zero validation exceptions.\nAPI compliant with OpenAPI spec." /></Field>
                <Field label="Gatekeepers" hint="Comma-separated"><TextInput value={arrayToText(gate.gatekeepers)} onChange={(e) => update(idx, { gatekeepers: textToArray(e.target.value) })} placeholder="Principal Architect, Security Lead" /></Field>
                <Field label="Remediation Path"><TextArea rows={2} value={gate.remediationPath} onChange={(e) => update(idx, { remediationPath: e.target.value })} placeholder="Steps to fix failures…" /></Field>
              </>
            }
          />
        ))}
        <AddButton onClick={add} label="Add Quality Gate" />
      </div>
    </SectionCard>
  );
};

const AIHandoffsEditor = ({
  handoffs,
  onChange,
}: {
  handoffs: AIHandoff[];
  onChange: (h: AIHandoff[]) => void;
}) => {
  const update = (idx: number, patch: Partial<AIHandoff>) =>
    onChange(handoffs.map((h, i) => (i === idx ? { ...h, ...patch } : h)));

  const add = () =>
    onChange([
      ...handoffs,
      { id: crypto.randomUUID(), taskName: "", targetAI: "", contextRequired: [], promptTemplate: "", expectedOutputFormat: "", instructions: "" },
    ]);

  const remove = (idx: number) => onChange(handoffs.filter((_, i) => i !== idx));

  return (
    <SectionCard>
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">AI Handoffs</p>
        <span className="text-[10px] text-[var(--text-tertiary)]">{handoffs.length} handoffs</span>
      </div>
      <div className="p-4 space-y-2">
        {handoffs.map((handoff, idx) => (
          <ExpandableItem
            key={handoff.id}
            onDelete={() => remove(idx)}
            summary={
              <span className="text-sm font-medium text-[var(--text-primary)] truncate">{handoff.taskName || <em className="text-[var(--text-tertiary)]">Untitled handoff</em>}</span>
            }
            editor={
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Task Name"><TextInput value={handoff.taskName} onChange={(e) => update(idx, { taskName: e.target.value })} placeholder="Generate SDK Bindings" /></Field>
                  <Field label="Target AI Tool"><TextInput value={handoff.targetAI} onChange={(e) => update(idx, { targetAI: e.target.value })} placeholder="Cursor IDE / Claude" /></Field>
                </div>
                <Field label="Context Required" hint="Comma-separated"><TextInput value={arrayToText(handoff.contextRequired)} onChange={(e) => update(idx, { contextRequired: textToArray(e.target.value) })} placeholder="OpenAPI schema, Auth token spec" /></Field>
                <Field label="Prompt Template"><TextArea rows={5} value={handoff.promptTemplate} onChange={(e) => update(idx, { promptTemplate: e.target.value })} placeholder="Write the full prompt to paste into your AI tool…" /></Field>
                <Field label="Expected Output Format"><TextInput value={handoff.expectedOutputFormat} onChange={(e) => update(idx, { expectedOutputFormat: e.target.value })} placeholder="TypeScript source file (client.ts)" /></Field>
                <Field label="Instructions"><TextArea rows={2} value={handoff.instructions} onChange={(e) => update(idx, { instructions: e.target.value })} placeholder="How to use this output…" /></Field>
              </>
            }
          />
        ))}
        <AddButton onClick={add} label="Add AI Handoff" />
      </div>
    </SectionCard>
  );
};

const RisksEditor = ({
  risks,
  onChange,
}: {
  risks: RiskItem[];
  onChange: (r: RiskItem[]) => void;
}) => {
  const CATEGORIES = ["product", "technical", "timeline", "adoption"] as const;
  const LEVELS = ["Low", "Medium", "High"] as const;

  const update = (idx: number, patch: Partial<RiskItem>) =>
    onChange(risks.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const add = () =>
    onChange([
      ...risks,
      { id: crypto.randomUUID(), category: "technical", description: "", likelihood: "Medium", impact: "Medium", mitigation: "" },
    ]);

  const remove = (idx: number) => onChange(risks.filter((_, i) => i !== idx));

  const riskColor = (level: string) => {
    if (level === "High") return "text-red-400";
    if (level === "Medium") return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <SectionCard>
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">Risks</p>
        <span className="text-[10px] text-[var(--text-tertiary)]">{risks.length} risks</span>
      </div>
      <div className="p-4 space-y-2">
        {risks.map((risk, idx) => (
          <ExpandableItem
            key={risk.id}
            onDelete={() => remove(idx)}
            summary={
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">{risk.description.slice(0, 60) || <em className="text-[var(--text-tertiary)]">Untitled risk</em>}</span>
                <span className={`flex-shrink-0 text-[10px] font-medium ${riskColor(risk.impact)}`}>{risk.impact}</span>
              </div>
            }
            editor={
              <>
                <Field label="Description"><TextArea rows={2} value={risk.description} onChange={(e) => update(idx, { description: e.target.value })} placeholder="What could go wrong…" /></Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Category">
                    <select value={risk.category} onChange={(e) => update(idx, { category: e.target.value as RiskItem["category"] })} className={`${fieldCls} h-10`}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Likelihood">
                    <select value={risk.likelihood} onChange={(e) => update(idx, { likelihood: e.target.value as RiskItem["likelihood"] })} className={`${fieldCls} h-10`}>
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="Impact">
                    <select value={risk.impact} onChange={(e) => update(idx, { impact: e.target.value as RiskItem["impact"] })} className={`${fieldCls} h-10`}>
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Mitigation Strategy"><TextArea rows={2} value={risk.mitigation} onChange={(e) => update(idx, { mitigation: e.target.value })} placeholder="How you will prevent or resolve this…" /></Field>
              </>
            }
          />
        ))}
        <AddButton onClick={add} label="Add Risk" />
      </div>
    </SectionCard>
  );
};

// ─── Main Editor Component ───────────────────────────────────────────────────

export const EditProject = ({ project, pageTransition, onSave, onCancel }: EditProjectProps) => {
  const [draft, setDraft] = useState<Project>(() => ({
    ...project,
    strategy: project.strategy ? { ...project.strategy, strategicPillars: [...project.strategy.strategicPillars] } : undefined,
    team: project.team ? { ...project.team, roles: project.team.roles.map((r) => ({ ...r })) } : undefined,
    workflow: project.workflow ? [...project.workflow] : undefined,
    deliverables: project.deliverables ? [...project.deliverables] : undefined,
    qualityGates: project.qualityGates ? [...project.qualityGates] : undefined,
    aiHandoffs: project.aiHandoffs ? [...project.aiHandoffs] : undefined,
    risks: project.risks ? [...project.risks] : undefined,
  }));

  const [isDirty, setIsDirty] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>("overview");

  const updateDraft = useCallback((updater: (prev: Project) => Project) => {
    setDraft(updater);
    setIsDirty(true);
    setSaveError(null);
    setSaveSuccess(false);
  }, []);

  const updateField = useCallback((key: keyof Project, value: unknown) => {
    updateDraft((prev) => ({ ...prev, [key]: value }));
  }, [updateDraft]);

  // Warn on browser navigation if there are unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleCancel = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard them and leave?")) return;
    onCancel();
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      setSaveError("Project name is required.");
      setActiveTab("overview");
      return;
    }
    setSaveLoading(true);
    setSaveError(null);
    try {
      await onSave(draft);
      setSaveSuccess(true);
      setIsDirty(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Save failed. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const ensureStrategy = (): NonNullable<Project["strategy"]> =>
    draft.strategy ?? {
      vision: "", mission: "", uniqueValueProp: "",
      strategicPillars: [],
      positioningMatrix: { axisX: "", axisY: "", notes: "" },
    };

  const ensureTeam = (): NonNullable<Project["team"]> =>
    draft.team ?? { teamName: "", roles: [], workflowRule: "", synergyNotes: "" };

  return (
    <motion.div
      key="edit"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleCancel}
            className="flex-shrink-0 p-1.5 hover:bg-[var(--bg-surface-hover)] rounded-md transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] truncate">{draft.name || "Untitled Project"}</h1>
              {isDirty && (
                <span className="flex-shrink-0 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">
                  Unsaved
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Edit mode — changes are saved manually</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-emerald-400"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </motion.div>
          )}
          {saveError && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {saveError}
            </span>
          )}
          <button
            onClick={handleCancel}
            className="btn-ghost text-xs px-3 h-8"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="btn-primary text-xs px-4 h-8 flex items-center gap-1.5 disabled:opacity-50"
          >
            {saveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saveLoading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar pb-px">
        {EDITOR_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap focus:outline-none ${
                isActive ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="edit-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "overview" && (
            <OverviewEditor draft={draft} update={updateField} />
          )}

          {activeTab === "strategy" && (
            <StrategyEditor
              strategy={ensureStrategy()}
              onChange={(s) => updateDraft((prev) => ({ ...prev, strategy: s }))}
            />
          )}

          {activeTab === "team" && (
            <TeamEditor
              team={ensureTeam()}
              onChange={(t) => updateDraft((prev) => ({ ...prev, team: t }))}
            />
          )}

          {activeTab === "workflow" && (
            <WorkflowEditor
              workflow={draft.workflow ?? []}
              onChange={(w) => updateDraft((prev) => ({ ...prev, workflow: w }))}
            />
          )}

          {activeTab === "deliverables" && (
            <DeliverablesEditor
              deliverables={draft.deliverables ?? []}
              onChange={(d) => updateDraft((prev) => ({ ...prev, deliverables: d }))}
            />
          )}

          {activeTab === "gates" && (
            <QualityGatesEditor
              gates={draft.qualityGates ?? []}
              onChange={(g) => updateDraft((prev) => ({ ...prev, qualityGates: g }))}
            />
          )}

          {activeTab === "handoffs" && (
            <AIHandoffsEditor
              handoffs={draft.aiHandoffs ?? []}
              onChange={(h) => updateDraft((prev) => ({ ...prev, aiHandoffs: h }))}
            />
          )}

          {activeTab === "risks" && (
            <RisksEditor
              risks={draft.risks ?? []}
              onChange={(r) => updateDraft((prev) => ({ ...prev, risks: r }))}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
