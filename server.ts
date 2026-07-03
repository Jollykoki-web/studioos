import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize Gemini SDK safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured or holds a placeholder.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// REST API for StudioOS Product Operating System Generator
app.post("/api/projects/generate", async (req, res) => {
  const { name, description, targetAudience } = req.body;

  if (!name || !description) {
    res.status(400).json({ error: "Product Name and Description are required." });
    return;
  }

  try {
    const ai = getGeminiClient();

    const systemPrompt = `You are the Principal Software Architect and Startup Product Strategist behind StudioOS, an elite AI-powered Product Operating System Generator.
Your job is to analyze the user's product idea and generate a comprehensive, highly rigorous, and executable "Product Operating System" (Product OS) configuration in JSON format.
This configuration must avoid vague buzzwords and focus on concrete, professional-grade deliverables, custom role allocations, actionable risk mitigations, a positioned strategy matrix, and high-quality AI handover prompts.

Provide your analysis in EXACTLY the schema described below. Do not use placeholders, do not use "implementation omitted", and do not craft lazy snippets. Ensure the plans are rich, detailed, and directly applicable.

Product Classification: Identify if the idea is a dev tool, consumer platform, AI API, Web3 system, or B2B SaaS, and align the output's tone and deliverables to this taxonomy.`;

    const instructionsPrompt = `Build a professional, complete Product Operating System for the following product setup:
- Product Name: "${name}"
- Product Description/Idea: "${description}"
- Target Audience: "${targetAudience || "General early adopters, developers, and founders"}"

Please output a strictly valid JSON object that matches the following structure:
{
  "name": "The Product Name",
  "description": "Elaborated vision and description of the product.",
  "targetAudience": "Refined target user profiles.",
  "strategy": {
    "vision": "A long-term aspirational 5-year vision statement.",
    "mission": "A concrete tactical mission statement.",
    "uniqueValueProp": "A sharp, clear, and un-slushy unique value proposition.",
    "strategicPillars": [
      { "title": "Pillar name (e.g. Edge First Architecture)", "explanation": "Deep tactical why and how." },
      ... exactly 4 high-value pillars ...
    ],
    "positioningMatrix": {
      "axisX": "Low API Friction -> High Customizability",
      "axisY": "Local Execution -> Realtime Collaborative Cloud",
      "notes": "Where this product wins against incumbent solutions."
    }
  },
  "team": {
    "teamName": "A catchy developer team moniker",
    "roles": [
      {
        "id": "role_id",
        "title": "Role title (e.g. Lead AI Systems Engineer, Edge Frontend Architect)",
        "count": 1,
        "responsibilities": ["Fully described task responsibility 1", "Fully described task responsibility 2"],
        "tools": ["Linear", "Vercel", "Tailwind", "Drizzle", "Langfuse"],
        "vibe": "A brief cultural or execution-style description of this role's ideal focus."
      },
      ... 3 to 4 distinct roles tailored to this specific framework ...
    ],
    "workflowRule": "A strict team operational protocol (e.g. RFC-First engineering with daily async check-ins and Slack-integrated status updates)",
    "synergyNotes": "How roles pass work back and forth to maintain maximum sprint velocity."
  },
  "workflow": [
    {
      "id": "wf_1",
      "phaseName": "Phase 1 Name",
      "description": "What this phase achieves.",
      "input": "Core requirements and assets starting this phase.",
      "process": "Step-by-step engineering cycle during this phase.",
      "output": "Concrete build outputs, tests, or configurations.",
      "timelineEstimate": "e.g. Sprint 1-2 (10 days)"
    },
    ... exactly 4 distinct engineering/design phases ...
  ],
  "deliverables": [
    {
      "id": "del_1",
      "name": "Deliverable Name",
      "category": "One of: code, design, strategy, marketing, infrastructure",
      "format": "Specification format, file types, or live system",
      "assignee": "Reference Role Title from the team",
      "description": "Complete actionable description of what this is.",
      "steps": ["Step 1", "Step 2", "Step 3"]
    },
    ... 4 to 6 core developer / designer deliverables ...
  ],
  "qualityGates": [
    {
      "id": "qg_1",
      "phase": "Reference Phase Name",
      "criteria": ["Verification criteria 1", "Verification criteria 2"],
      "gatekeepers": ["Assignee Role Titles"],
      "remediationPath": "Action plan if the gate checks fail."
    },
    ... 3 to 4 quality gates corresponding to phases ...
  ],
  "aiHandoffs": [
    {
      "id": "ah_1",
      "taskName": "Task title to hand off to an LLM",
      "targetAI": "Name of AI framework or specialized assistant (e.g. Gemini 3.5 Flash for System Copywritting, Cursor IDE)",
      "contextRequired": ["Required file types, schemas, or variables"],
      "promptTemplate": "A detailed, robust system prompt that a user can COPY-PASTE directly to an AI to generate this work.",
      "expectedOutputFormat": "Format of output (e.g. Markdown spec, JSON interface)",
      "instructions": "Tactical notes on refining the AI output."
    },
    ... 2 to 3 tailored AI handoffs ...
  ],
  "risks": [
    {
      "id": "risk_1",
      "category": "One of: product, technical, timeline, adoption",
      "description": "The specific bottleneck threat.",
      "likelihood": "Low or Medium or High",
      "impact": "Low or Medium or High",
      "mitigation": "Unbiased proactive engineering resolution. Avoid simple statements; make them concrete."
    },
    ... 3 to 4 critical risks ...
  ]
}`;

    const timeoutMs = 45000;

    const extractJson = (text: string) => {
      let t = text.trim();
      if (t.startsWith("```json")) t = t.replace(/^```json/, "");
      if (t.startsWith("```")) t = t.replace(/^```/, "");
      if (t.endsWith("```")) t = t.replace(/```$/, "");
      return JSON.parse(t.trim());
    };

    const fetchWithTimeout = async (url: string, options: any) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (err) {
        clearTimeout(id);
        throw err;
      }
    };

    let parsedOS: any = null;
    let usedProvider = "";
    let usedModel = "";
    const startTime = Date.now();
    let generationError: any = null;
    let generationDetails = "";
    let generationLog = [];

    // 1. Primary: Gemini 2.5 Flash
    try {
      usedProvider = "Google Gemini";
      usedModel = "gemini-2.5-flash";
      const ai = getGeminiClient();
      const generatePromise = ai.models.generateContent({
        model: usedModel,
        contents: instructionsPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out after 45 seconds.")), timeoutMs)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]) as any;
      if (!response.text) throw new Error("Empty response from Gemini.");
      try {
        parsedOS = extractJson(response.text);
      } catch (jsonErr) {
        // Automatic JSON repair attempt
        console.warn("JSON malformed from Gemini. Attempting automatic repair...");
        const repairResponse = await ai.models.generateContent({
          model: usedModel,
          contents: "Fix this malformed JSON and return ONLY valid JSON: " + response.text,
          config: { responseMimeType: "application/json" }
        });
        parsedOS = extractJson(repairResponse.text);
      }
    } catch (geminiError: any) {
      generationLog.push(`Gemini failed: ${geminiError.message}`);
      console.warn("Gemini generation failed. Attempting fallback to Groq...", geminiError.message);

      // 2. Fallback: Groq
      try {
        usedProvider = "Groq";
        usedModel = "llama-3.3-70b-versatile";

        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) throw new Error("GROQ_API_KEY is not configured.");

        const groqResp = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: usedModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: instructionsPrompt }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
          })
        });

        if (!groqResp.ok) {
          const e = await groqResp.text();
          throw new Error(`API error: ${groqResp.status} ${e}`);
        }

        const groqData = await groqResp.json();
        parsedOS = extractJson(groqData.choices[0].message.content);
      } catch (groqError: any) {
        generationLog.push(`Groq failed: ${groqError.message}`);
        console.warn("Groq generation failed. Attempting final fallback to OpenRouter...", groqError.message);

        // 3. Final Fallback: OpenRouter
        try {
          usedProvider = "OpenRouter";
          usedModel = "mistralai/mistral-7b-instruct:free";

          const orKey = process.env.OPENROUTER_API_KEY;
          if (!orKey) throw new Error("OPENROUTER_API_KEY is not configured.");

          const orResp = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${orKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "StudioOS"
            },
            body: JSON.stringify({
              model: usedModel,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: instructionsPrompt + "\n\nReturn strictly valid JSON only. Do not wrap in markdown blocks." }
              ],
              temperature: 0.2
            })
          });

          if (!orResp.ok) {
            const e = await orResp.text();
            throw new Error(`API error: ${orResp.status} ${e}`);
          }

          const orData = await orResp.json();
          parsedOS = extractJson(orData.choices[0].message.content);
        } catch (orError: any) {
          generationLog.push(`OpenRouter failed: ${orError.message}`);
          generationError = orError;
          generationDetails = generationLog.join(" | ");
          console.error("All AI providers exhausted.", orError);
        }
      }
    }

    if (!parsedOS) {
      res.status(500).json({
        error: "Engine generation failed completely across all fallback providers.",
        details: generationDetails,
        technicalDetails: generationError?.message || String(generationError),
        instructions: "Verify API keys (Gemini, Groq, OpenRouter) and ensure you have not hit rate limits."
      });
      return;
    }

    const durationMs = Date.now() - startTime;

    res.json({
      success: true,
      project: parsedOS,
      metadata: {
        provider: usedProvider,
        model: usedModel,
        durationMs,
        timestamp: new Date().toISOString()
      }
    });
    return;
  } catch (error: any) {
    console.error("StudioOS Core Engine Error:", error);
    res.status(500).json({
      error: "Unexpected system error during initialization.",
      details: "The generation service encountered a fatal failure before contacting providers.",
      technicalDetails: error?.message || String(error)
    });
    return;
  }
});

const PROJECTS_FILE = path.join(process.cwd(), "projects-db.json");

// Lazy Supabase Client Initializer & URL Sanitizer
function cleanSupabaseUrl(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;
  let url = rawUrl.trim();
  if (url === "MY_SUPABASE_URL" || url === "") return null;

  // Strip trailing slashes and common prefixes/suffixes
  url = url.replace(/\/+$/, ""); // trailing slashes
  url = url.replace(/\/rest\/v1\/?$/, ""); // strip /rest/v1 or /rest/v1/

  // Ensure correct protocol is prefixed
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
}

function getSupabase(authHeader?: string) {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  const url = cleanSupabaseUrl(rawUrl);
  if (!url || !key || key === "MY_SUPABASE_ANON_KEY" || key.trim() === "") {
    return null;
  }
  const options = authHeader ? { global: { headers: { Authorization: authHeader } } } : {};
  return createClient(url, key.trim(), options);
}

// --------------------------------------------------------------------------
// LOCAL FILE BACKEND (FALLBACK)
// --------------------------------------------------------------------------
async function readProjectsFile(): Promise<any[]> {
  try {
    if (!fs.existsSync(PROJECTS_FILE)) {
      return [];
    }
    const data = await fs.promises.readFile(PROJECTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Fallback: Error reading projects file:", err);
    return [];
  }
}

async function writeProjectsFile(projects: any[]): Promise<void> {
  try {
    await fs.promises.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
  } catch (err) {
    console.error("Fallback: Error writing projects file:", err);
  }
}

// --------------------------------------------------------------------------
// SUPABASE POSTGRESQL BACKEND RELATION MAPS
// --------------------------------------------------------------------------
async function getProjectsFromSupabase(supabase: any, userId: string): Promise<any[]> {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase load projects error:", error.message || error);
    throw new Error(error.message || String(error));
  }

  if (!projects || projects.length === 0) return [];

  const projectIds = projects.map((p: any) => p.id);

  const results = await Promise.all([
    supabase.from("strategies").select("*").in("project_id", projectIds),
    supabase.from("strategic_pillars").select("*").in("project_id", projectIds).order("order_index", { ascending: true }),
    supabase.from("teams").select("*").in("project_id", projectIds),
    supabase.from("team_roles").select("*").in("project_id", projectIds),
    supabase.from("workflows").select("*").in("project_id", projectIds).order("order_index", { ascending: true }),
    supabase.from("deliverables").select("*").in("project_id", projectIds).order("order_index", { ascending: true }),
    supabase.from("quality_gates").select("*").in("project_id", projectIds).order("order_index", { ascending: true }),
    supabase.from("handoffs").select("*").in("project_id", projectIds).order("order_index", { ascending: true }),
    supabase.from("risks").select("*").in("project_id", projectIds).order("order_index", { ascending: true }),
    supabase.from("ai_conversations").select("*").in("project_id", projectIds).order("created_at", { ascending: true })
  ]);

  // If any subtable fetch has an error, treat the load as failed to prevent returning partial data
  for (const res of results) {
    if (res.error) {
      console.error("Supabase load subtable error:", res.error.message || res.error);
      throw new Error(res.error.message || String(res.error));
    }
  }

  const [
    { data: strategies },
    { data: strategicPillars },
    { data: teams },
    { data: teamRoles },
    { data: workflows },
    { data: deliverables },
    { data: qualityGates },
    { data: handoffs },
    { data: risks },
    { data: conversations }
  ] = results;

  return projects.map((p: any) => {
    const strat = strategies?.find((s: any) => s.project_id === p.id);
    const pillars = strategicPillars?.filter((sp: any) => sp.project_id === p.id) || [];
    const t = teams?.find((tm: any) => tm.project_id === p.id);
    const roles = teamRoles?.filter((tr: any) => tr.project_id === p.id) || [];
    const wf = workflows?.filter((w: any) => w.project_id === p.id) || [];
    const del = deliverables?.filter((d: any) => d.project_id === p.id) || [];
    const qg = qualityGates?.filter((q: any) => q.project_id === p.id) || [];
    const ah = handoffs?.filter((h: any) => h.project_id === p.id) || [];
    const rsk = risks?.filter((r: any) => r.project_id === p.id) || [];
    const conv = conversations?.filter((c: any) => c.project_id === p.id) || [];

    const project: any = {
      id: p.id,
      userId: p.user_id,
      name: p.name,
      description: p.description,
      targetAudience: p.target_audience,
      status: p.status || "active",
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };

    if (p.ai_model) {
      project.aiMetadata = {
        model: p.ai_model,
        provider: p.ai_provider,
        generationTime: p.ai_generation_time,
        durationMs: p.ai_duration_ms
      };
    }

    if (strat) {
      project.strategy = {
        vision: strat.vision,
        mission: strat.mission,
        uniqueValueProp: strat.unique_value_prop,
        strategicPillars: pillars.map((sp: any) => ({
          title: sp.title,
          explanation: sp.explanation
        })),
        positioningMatrix: {
          axisX: strat.axis_x,
          axisY: strat.axis_y,
          notes: strat.notes
        }
      };
    }

    if (t) {
      project.team = {
        teamName: t.team_name,
        workflowRule: t.workflow_rule,
        synergyNotes: t.synergy_notes,
        roles: roles.map((r: any) => ({
          id: r.id,
          title: r.title,
          count: r.count,
          vibe: r.vibe,
          responsibilities: r.responsibilities || [],
          tools: r.tools || []
        }))
      };
    }

    if (wf.length > 0) {
      project.workflow = wf.map((w: any) => ({
        id: w.id,
        phaseName: w.phase_name,
        description: w.description,
        input: w.input,
        process: w.process,
        output: w.output,
        timelineEstimate: w.timeline_estimate
      }));
    }

    if (del.length > 0) {
      project.deliverables = del.map((d: any) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        format: d.format,
        assignee: d.assignee,
        description: d.description,
        steps: d.steps || []
      }));
    }

    if (qg.length > 0) {
      project.qualityGates = qg.map((q: any) => ({
        id: q.id,
        phase: q.phase,
        criteria: q.criteria || [],
        gatekeepers: q.gatekeepers || [],
        remediationPath: q.remediation_path
      }));
    }

    if (ah.length > 0) {
      project.aiHandoffs = ah.map((h: any) => ({
        id: h.id,
        taskName: h.task_name,
        targetAI: h.target_ai,
        contextRequired: h.context_required || [],
        promptTemplate: h.prompt_template,
        expectedOutputFormat: h.expected_output_format,
        instructions: h.instructions
      }));
    }

    if (rsk.length > 0) {
      project.risks = rsk.map((r: any) => ({
        id: r.id,
        category: r.category,
        description: r.description,
        likelihood: r.likelihood,
        impact: r.impact,
        mitigation: r.mitigation
      }));
    }

    if (conv.length > 0) {
      project.conversations = conv.map((c: any) => ({
        id: c.id,
        projectId: c.project_id,
        role: c.role,
        message: c.message,
        createdAt: c.created_at
      }));
    }

    return project;
  });
}

async function saveProjectToSupabase(supabase: any, project: any, userId: string): Promise<void> {
  const { error: projError } = await supabase.from("projects").upsert({
    id: project.id,
    user_id: userId,
    name: project.name,
    description: project.description,
    target_audience: project.targetAudience,
    status: project.status || "active",
    ai_model: project.aiMetadata?.model,
    ai_provider: project.aiMetadata?.provider,
    ai_generation_time: project.aiMetadata?.generationTime,
    ai_duration_ms: project.aiMetadata?.durationMs,
    created_at: project.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  if (projError) throw projError;

  // Log activity
  await supabase.from("activity_log").insert({
    user_id: userId,
    action: "Project Saved",
    details: { project_id: project.id, name: project.name }
  });

  // Clear dependent relational items before writing new structures
  await Promise.all([
    supabase.from("strategies").delete().eq("project_id", project.id),
    supabase.from("strategic_pillars").delete().eq("project_id", project.id),
    supabase.from("teams").delete().eq("project_id", project.id),
    supabase.from("team_roles").delete().eq("project_id", project.id),
    supabase.from("workflows").delete().eq("project_id", project.id),
    supabase.from("deliverables").delete().eq("project_id", project.id),
    supabase.from("quality_gates").delete().eq("project_id", project.id),
    supabase.from("handoffs").delete().eq("project_id", project.id),
    supabase.from("risks").delete().eq("project_id", project.id),
    supabase.from("ai_conversations").delete().eq("project_id", project.id),
  ]);

  const promises: Promise<any>[] = [];

  // Write Strategy
  if (project.strategy) {
    promises.push(
      supabase.from("strategies").insert({
        project_id: project.id,
        vision: project.strategy.vision,
        mission: project.strategy.mission,
        unique_value_prop: project.strategy.uniqueValueProp,
        axis_x: project.strategy.positioningMatrix?.axisX,
        axis_y: project.strategy.positioningMatrix?.axisY,
        notes: project.strategy.positioningMatrix?.notes
      })
    );

    if (project.strategy.strategicPillars) {
      project.strategy.strategicPillars.forEach((p: any, idx: number) => {
        promises.push(
          supabase.from("strategic_pillars").insert({
            project_id: project.id,
            title: p.title,
            explanation: p.explanation,
            order_index: idx
          })
        );
      });
    }
  }

  // Write Team
  if (project.team) {
    promises.push(
      supabase.from("teams").insert({
        project_id: project.id,
        team_name: project.team.teamName,
        workflow_rule: project.team.workflowRule,
        synergy_notes: project.team.synergyNotes
      })
    );

    if (project.team.roles) {
      project.team.roles.forEach((r: any) => {
        promises.push(
          supabase.from("team_roles").insert({
            id: r.id,
            project_id: project.id,
            title: r.title,
            count: r.count,
            vibe: r.vibe,
            responsibilities: r.responsibilities,
            tools: r.tools
          })
        );
      });
    }
  }

  // Write Workflows
  if (project.workflow) {
    project.workflow.forEach((w: any, idx: number) => {
      promises.push(
        supabase.from("workflows").insert({
          id: w.id,
          project_id: project.id,
          phase_name: w.phaseName,
          description: w.description,
          input: w.input,
          process: w.process,
          output: w.output,
          timeline_estimate: w.timelineEstimate,
          order_index: idx
        })
      );
    });
  }

  // Write Deliverables
  if (project.deliverables) {
    project.deliverables.forEach((d: any, idx: number) => {
      promises.push(
        supabase.from("deliverables").insert({
          id: d.id,
          project_id: project.id,
          name: d.name,
          category: d.category,
          format: d.format,
          assignee: d.assignee,
          description: d.description,
          steps: d.steps,
          order_index: idx
        })
      );
    });
  }

  // Write Quality Gates
  if (project.qualityGates) {
    project.qualityGates.forEach((q: any, idx: number) => {
      promises.push(
        supabase.from("quality_gates").insert({
          id: q.id,
          project_id: project.id,
          phase: q.phase,
          criteria: q.criteria,
          gatekeepers: q.gatekeepers,
          remediation_path: q.remediationPath,
          order_index: idx
        })
      );
    });
  }

  // Write Handoffs
  if (project.aiHandoffs) {
    project.aiHandoffs.forEach((h: any, idx: number) => {
      promises.push(
        supabase.from("handoffs").insert({
          id: h.id,
          project_id: project.id,
          task_name: h.taskName,
          target_ai: h.targetAI,
          context_required: h.contextRequired,
          prompt_template: h.promptTemplate,
          expected_output_format: h.expectedOutputFormat,
          instructions: h.instructions,
          order_index: idx
        })
      );
    });
  }

  // Write Risks
  if (project.risks) {
    project.risks.forEach((r: any, idx: number) => {
      promises.push(
        supabase.from("risks").insert({
          id: r.id || crypto.randomUUID(),
          project_id: project.id,
          category: r.category,
          description: r.description,
          likelihood: r.likelihood,
          impact: r.impact,
          mitigation: r.mitigation,
          order_index: idx
        })
      );
    });
  }

  // Write Conversations
  if (project.conversations) {
    project.conversations.forEach((c: any) => {
      promises.push(
        supabase.from("ai_conversations").insert({
          id: c.id || crypto.randomUUID(),
          project_id: project.id,
          role: c.role,
          message: c.message,
          created_at: c.createdAt || new Date().toISOString()
        })
      );
    });
  }

  await Promise.all(promises);
}

// --------------------------------------------------------------------------
// REST API ENDPOINTS
// --------------------------------------------------------------------------
app.get("/api/database/status", async (req, res) => {
  const rawUrl = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || "";
  const url = cleanSupabaseUrl(rawUrl);
  const hasEnv = !!(url && key && key !== "MY_SUPABASE_ANON_KEY" && key.trim() !== "");

  if (!hasEnv || !url) {
    res.json({
      success: true,
      connected: false,
      configured: false,
      supabaseUrl: rawUrl ? `${rawUrl.substring(0, 15)}...` : "",
      error: "Supabase environment variables (SUPABASE_URL or SUPABASE_ANON_KEY) are missing or set to placeholder values.",
      tables: {}
    });
    return;
  }

  const supabase = createClient(url, key.trim());
  const tables = [
    "projects",
    "strategies",
    "strategic_pillars",
    "teams",
    "team_roles",
    "workflows",
    "deliverables",
    "quality_gates",
    "handoffs",
    "risks"
  ];

  const tableStatus: Record<string, { exists: boolean; error: string | null }> = {};
  let overallConnected = true;
  let connectionError: string | null = null;

  try {
    for (const table of tables) {
      const selectCol = (table === "strategies" || table === "teams") ? "project_id" : "id";
      const { error } = await supabase.from(table).select(selectCol).limit(1);
      // Special check since strategic_pillars uses serial ID, but has project_id or id
      // A "relation does not exist" error means table is missing.
      if (error) {
        const errMsg = error.message || String(error);
        if (errMsg.includes("relation") && errMsg.includes("does not exist")) {
          tableStatus[table] = { exists: false, error: "Table does not exist on Supabase schema." };
        } else {
          // Some other error (auth issue, permission, etc.)
          tableStatus[table] = { exists: true, error: errMsg };
        }
      } else {
        tableStatus[table] = { exists: true, error: null };
      }
    }
  } catch (err: any) {
    overallConnected = false;
    connectionError = err?.message || String(err);
  }

  // Check if any critical tables are missing
  const missingTables = tables.filter(t => !tableStatus[t]?.exists);

  res.json({
    success: true,
    connected: overallConnected,
    configured: true,
    supabaseUrl: url ? `${url.substring(0, 20)}...` : "",
    error: connectionError,
    missingTables,
    tables: tableStatus
  });
});

app.get("/api/projects", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "").trim();
  const supabase = getSupabase(authHeader);
  let supabaseError = null;
  const hasSupabaseEnv = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_URL !== "MY_SUPABASE_URL");

  // SECURITY: If the user provided a token, they MUST only be served their own isolated data from Supabase.
  // If Supabase is not configured, we cannot serve them isolated data. We must return an error rather than falling back to a shared file.
  if (token) {
    if (!supabase) {
      res.status(503).json({ error: "Database temporarily unavailable. Please restart the server to load environment variables." });
      return;
    }
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const projects = await getProjectsFromSupabase(supabase, user.id);
      res.json({ success: true, database: "supabase", projects });
      return;
    } catch (err: any) {
      console.warn("Supabase fetch failed.", err?.message || err);
      res.status(503).json({
        error: "Database temporarily unavailable.",
        details: err?.message || String(err)
      });
      return;
    }
  }

  // Only reach here for unauthenticated / guest scenarios
  const projects = await readProjectsFile();
  res.json({
    success: true,
    database: "local-file-fallback",
    supabaseConfigured: hasSupabaseEnv,
    supabaseError,
    projects: projects
  });
});

app.post("/api/projects", async (req, res) => {
  const { project } = req.body;
  if (!project) {
    res.status(400).json({ error: "Project payload is required." });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "").trim();
  const supabase = getSupabase(authHeader);
  let supabaseError = null;
  const hasSupabaseEnv = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_URL !== "MY_SUPABASE_URL");

  if (token) {
    if (!supabase) {
      res.status(503).json({ error: "Database temporarily unavailable. Please restart the server." });
      return;
    }
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await saveProjectToSupabase(supabase, project, user.id);
      res.json({ success: true, database: "supabase", project });
      return;
    } catch (err: any) {
      console.warn("Supabase save failed.", err?.message || err);
      res.status(503).json({
        error: "Database temporarily unavailable.",
        details: err?.message || String(err)
      });
      return;
    }
  }

  // Fallback save to local file (unauthenticated only)
  const projects = await readProjectsFile();
  const otherProjects = projects.filter(p => p.id !== project.id);
  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString()
  };
  const updatedProjects = [...otherProjects, updatedProject];
  await writeProjectsFile(updatedProjects);
  res.json({
    success: true,
    database: "local-file-fallback",
    supabaseConfigured: hasSupabaseEnv,
    supabaseError,
    project: updatedProject
  });
});

app.delete("/api/projects/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ error: "Project ID is required." });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "").trim();
  const supabase = getSupabase(authHeader);
  let supabaseError = null;
  const hasSupabaseEnv = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_URL !== "MY_SUPABASE_URL");

  if (token) {
    if (!supabase) {
      res.status(503).json({ error: "Database temporarily unavailable. Please restart the server." });
      return;
    }
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;

      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: "Project Deleted",
        details: { project_id: id }
      });

      res.json({ success: true, database: "supabase" });
      return;
    } catch (err: any) {
      console.warn("Supabase delete failed.", err?.message || err);
      res.status(503).json({
        error: "Database temporarily unavailable.",
        details: err?.message || String(err)
      });
      return;
    }
  }

  // Fallback delete on local file
  const projects = await readProjectsFile();
  const filteredProjects = projects.filter(p => p.id !== id);
  await writeProjectsFile(filteredProjects);
  res.json({
    success: true,
    database: "local-file-fallback",
    supabaseConfigured: hasSupabaseEnv,
    supabaseError
  });
});


// Configure Vite dynamic middleware or serve static pages
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Cast to `any` to bridge Connect.Server → Express middleware type gap
    app.use(vite.middlewares as any);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudioOS Server is online at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Server Boot Failure", err);
});
