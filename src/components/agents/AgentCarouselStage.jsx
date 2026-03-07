import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AgentIcon3D from "./AgentIcon3D.jsx";
import { cn, relativeIndex, slotConfig, wrapIndex } from "./agent-utils.js";

const DRAG_THRESHOLD = 70;

export default function AgentCarouselStage({ agents, activeIndex, setActiveIndex }) {
  const activeAgent = agents[activeIndex];

  function goPrev() {
    setActiveIndex((prev) => wrapIndex(prev - 1, agents.length));
  }

  function goNext() {
    setActiveIndex((prev) => wrapIndex(prev + 1, agents.length));
  }

  return (
    <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-[18%] top-[-12%] h-[46%] rounded-full blur-3xl"
          style={{ background: activeAgent.accent.soft }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
        <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      </div>

      <div className="relative mb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.26em] text-white/55">
          Agent Carousel
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x <= -DRAG_THRESHOLD) goNext();
          if (info.offset.x >= DRAG_THRESHOLD) goPrev();
        }}
        className="relative min-h-[28rem] cursor-grab active:cursor-grabbing md:min-h-[34rem]"
      >
        {agents.map((agent, index) => {
          const slot = relativeIndex(index, activeIndex, agents.length);
          const view = slotConfig(slot);
          const isActive = slot === 0;

          return (
            <motion.button
              key={agent.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              initial={false}
              animate={{
                x: view.x,
                y: view.y,
                scale: view.scale,
                opacity: view.opacity,
                filter: view.filter,
              }}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-left"
              style={{
                width: view.width,
                zIndex: view.zIndex,
              }}
            >
              <div
                className={cn(
                  "mx-auto rounded-[34px] border bg-gradient-to-b from-white/[0.06] via-white/[0.025] to-transparent p-5 backdrop-blur-md transition duration-500 md:p-8",
                  isActive ? agent.accent.border : "border-white/6",
                  isActive ? agent.accent.glow : ""
                )}
              >
                <div className="flex flex-col items-center justify-center gap-4 text-center md:flex-row md:gap-8">
                  <div className="relative h-24 w-24 shrink-0 md:h-36 md:w-36">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl"
                      style={{ background: agent.accent.soft }}
                    />
                    <AgentIcon3D
                      variant={agent.iconVariant}
                      accent={agent.accent.hex}
                      className="relative h-full w-full"
                    />
                  </div>

                  <div className="min-w-0">
                    <div
                      className={cn(
                        "mb-3 inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.26em]",
                        agent.accent.badge
                      )}
                    >
                      {agent.role}
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <h2
                        className={cn(
                          "font-semibold tracking-[-0.055em] text-white",
                          isActive
                            ? "text-[clamp(42px,8vw,118px)]"
                            : "text-[clamp(22px,4vw,48px)]"
                        )}
                      >
                        {agent.name}
                      </h2>
                    </div>

                    <p
                      className={cn(
                        "mx-auto mt-3 max-w-2xl leading-relaxed text-white/58",
                        isActive ? "text-base md:text-lg" : "text-sm"
                      )}
                    >
                      {agent.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="relative mt-2 flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/55">
          Soldan sağa sürüşdür, agent ön plana gəlsin
        </div>

        <div className="flex items-center gap-2">
          {agents.map((agent, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  active ? "w-9 bg-white" : "w-2.5 bg-white/22 hover:bg-white/38"
                )}
                aria-label={agent.name}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}