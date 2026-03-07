import { useMemo, useState } from "react";
import AgentCarouselStage from "../components/agents/AgentCarouselStage.jsx";
import AgentSpotlightPanel from "../components/agents/AgentSpotlightPanel.jsx";
import AgentProfilesStrip from "../components/agents/AgentProfilesStrip.jsx";
import AgentStudio from "../components/agents/AgentStudio.jsx";
import AgentKernelPanel from "../components/agents/AgentKernelPanel.jsx";
import AgentCapabilityMatrix from "../components/agents/AgentCapabilityMatrix.jsx";
import { AGENTS } from "../components/agents/agent-data.js";

export default function Agents() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeAgent = AGENTS[activeIndex];

  const headerStats = useMemo(
    () => [
      { label: "Active identities", value: "04" },
      { label: "Kernel mode", value: "Layered" },
      { label: "Prompt routing", value: "Live" },
    ],
    []
  );

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#03060d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-20 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: activeAgent.accent.soft }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_32%),linear-gradient(180deg,#050913_0%,#03060d_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.06]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 pb-16 pt-6 md:px-6 lg:px-8">
        <section className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white/48">
              AI HQ · Agents
            </div>
            <h1 className="mt-4 max-w-4xl text-[clamp(34px,5vw,74px)] font-semibold tracking-[-0.06em] text-white">
              A cinematic agent command surface built around depth, focus, and identity.
            </h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {headerStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 backdrop-blur-xl"
              >
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                  {item.label}
                </div>
                <div className="mt-2 text-xl font-medium text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <AgentCarouselStage
          agents={AGENTS}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />

        <AgentSpotlightPanel agent={activeAgent} />

        <AgentProfilesStrip
          agents={AGENTS}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />

        <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <AgentStudio agent={activeAgent} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.98fr_1.02fr]">
          <AgentKernelPanel />
          <AgentCapabilityMatrix agents={AGENTS} activeIndex={activeIndex} />
        </section>
      </div>
    </div>
  );
}