import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import AnalyticsTopbar from "../components/analytics/AnalyticsTopbar.jsx";
import AnalyticsHero from "../components/analytics/AnalyticsHero.jsx";
import MainChartSurface from "../components/analytics/MainChartSurface.jsx";
import KPIGrid from "../components/analytics/KPIGrid.jsx";
import ContentMixCard from "../components/analytics/ContentMixCard.jsx";
import InsightCard from "../components/analytics/InsightCard.jsx";
import { PLATFORMS } from "../components/analytics/analytics-data.js";
import { buildSeries, compact } from "../components/analytics/analytics-utils.js";

export default function Analytics() {
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [activeRange, setActiveRange] = useState("1M");

  const platform = PLATFORMS[activePlatform];
  const series = useMemo(
    () => buildSeries(activeRange, platform),
    [activeRange, platform]
  );
  const heroValue = useMemo(
    () => compact(series[series.length - 1]?.value || 0),
    [series]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040612] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(95,83,255,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(0,188,255,0.08),transparent_24%),linear-gradient(180deg,#040612_0%,#040715_40%,#030611_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:96px_96px]" />
      <div className="pointer-events-none absolute left-[-140px] top-[120px] h-[360px] w-[360px] rounded-full bg-cyan-400/8 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-120px] top-[100px] h-[360px] w-[360px] rounded-full bg-violet-400/8 blur-[140px]" />

      <main className="relative mx-auto flex w-full max-w-[1560px] flex-col gap-6 px-5 py-6 md:px-8 xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnalyticsTopbar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.46, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnalyticsHero
            platform={platform}
            activeRange={activeRange}
            heroValue={heroValue}
            onPlatformChange={setActivePlatform}
            onRangeChange={setActiveRange}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <MainChartSurface
            platform={platform}
            activeRange={activeRange}
            series={series}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          <KPIGrid platform={platform} />
        </motion.div>

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <ContentMixCard platform={platform} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <InsightCard platform={platform} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}