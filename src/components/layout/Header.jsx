import { useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Globe,
  Instagram,
  Linkedin,
  Facebook,
  Mail,
  Orbit,
  PanelRightOpen,
  Shield,
  Sparkles,
  ScanSearch,
  Command,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com/",
    icon: Instagram,
    tint:
      "from-fuchsia-400/16 via-pink-400/8 to-transparent text-fuchsia-100/90",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/",
    icon: Facebook,
    tint: "from-sky-400/16 via-cyan-300/8 to-transparent text-cyan-100/90",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    icon: Linkedin,
    tint:
      "from-blue-400/16 via-indigo-300/8 to-transparent text-sky-100/90",
  },
  {
    label: "Website",
    href: "https://example.com/",
    icon: Globe,
    tint:
      "from-white/[0.10] via-cyan-300/[0.04] to-transparent text-white/90",
  },
];

const QUICK_LINKS = [
  {
    label: "Open Command Rail",
    sub: "Sidebar and mobile navigation",
    icon: PanelRightOpen,
    action: "rail",
  },
  {
    label: "Signal Layer",
    sub: "Realtime intelligence surface",
    icon: ScanSearch,
    action: "none",
  },
  {
    label: "Executive Access",
    sub: "Secure premium layer",
    icon: Shield,
    action: "none",
  },
  {
    label: "Partner Reach",
    sub: "Brand and outbound routes",
    icon: BriefcaseBusiness,
    action: "none",
  },
];

const sheetMotion = {
  hidden: {
    opacity: 0,
    x: 26,
    scale: 0.992,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: 18,
    scale: 0.996,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
};

function SocialCard({ label, href, icon: Icon, tint }) {
  return (
    <motion.a
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tint}`}
      />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(220px_circle_at_0%_0%,rgba(255,255,255,0.07),transparent_42%)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.04]">
          <Icon className="h-[17px] w-[17px]" />
        </div>

        <ArrowUpRight className="h-4 w-4 text-white/34 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/76" />
      </div>

      <div className="relative mt-5">
        <div className="text-[13px] font-semibold tracking-[0.08em] text-white/92">
          {label}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/38">
          External Route
        </div>
      </div>
    </motion.a>
  );
}

function QuickAction({ item, onRailOpen }) {
  const Icon = item.icon;
  const isButton = item.action === "rail";

  const content = (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(220px_circle_at_0%_0%,rgba(34,211,238,0.08),transparent_42%)]" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.04] text-cyan-100/80">
          <Icon className="h-[16px] w-[16px]" />
        </div>

        <div className="min-w-0">
          <div className="text-[13px] font-semibold tracking-[0.04em] text-white/88">
            {item.label}
          </div>
          <div className="mt-1 text-[12px] leading-5 text-white/42">
            {item.sub}
          </div>
        </div>
      </div>
    </>
  );

  if (isButton) {
    return (
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        onClick={onRailOpen}
        className="group relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        {content}
      </motion.button>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {content}
    </div>
  );
}

export default function Header({ onMenuClick }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const openNav = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const closeNav = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 120);
  };

  const handleRailOpen = () => {
    setOpen(false);
    onMenuClick?.();
  };

  return (
    <div className="fixed right-4 top-4 z-[140] md:right-5 md:top-5 lg:right-6 lg:top-6">
      <div
        className="relative"
        onMouseEnter={openNav}
        onMouseLeave={closeNav}
      >
        <motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          className="group relative flex h-[58px] items-center gap-3 overflow-hidden rounded-[22px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,16,30,0.68),rgba(5,9,18,0.48))] pl-3 pr-4 shadow-[0_22px_72px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(260px_circle_at_100%_0%,rgba(129,92,255,0.12),transparent_34%),radial-gradient(220px_circle_at_0%_0%,rgba(34,211,238,0.08),transparent_38%)]" />

          <div className="relative flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.045] text-white/88">
            <Command className="h-[17px] w-[17px]" />
          </div>

          <div className="relative hidden sm:block text-left leading-none">
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/82">
              Access Layer
            </div>
            <div className="mt-1 text-[11px] tracking-[0.08em] text-white/42">
              hover • routes • launch
            </div>
          </div>

          <div className="relative ml-1 h-2 w-2 rounded-full bg-cyan-300/90 shadow-[0_0_14px_rgba(103,232,249,0.85)]" />
        </motion.button>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.18 } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                className="pointer-events-none absolute right-0 top-[calc(100%+10px)] h-[78vh] w-[min(560px,calc(100vw-1.5rem))] rounded-[34px] bg-[linear-gradient(270deg,rgba(8,14,24,0.20),rgba(8,14,24,0.10),rgba(8,14,24,0.00))] blur-2xl"
              />

              <motion.aside
                variants={sheetMotion}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 top-[calc(100%+10px)] w-[min(560px,calc(100vw-1.5rem))] overflow-hidden rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(6,10,20,0.70),rgba(3,6,14,0.58))] shadow-[-24px_26px_90px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[18px]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_100%_0%,rgba(129,92,255,0.12),transparent_36%),radial-gradient(360px_circle_at_0%_0%,rgba(34,211,238,0.07),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_24%)]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(180deg,black,transparent_92%)]" />

                <div className="relative max-h-[78vh] overflow-y-auto">
                  <div className="border-b border-white/[0.07] px-5 py-5 md:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.045] text-cyan-100/88">
                        <Orbit className="h-[18px] w-[18px]" />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-[10px] font-semibold uppercase tracking-[0.34em] text-white/58">
                          Floating Access Layer
                        </div>
                        <div className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-white">
                          Right-side hover nav
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-5 md:px-6">
                    <div className="space-y-5">
                      <div className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/72">
                          <Sparkles className="h-3.5 w-3.5 text-cyan-200/82" />
                          Executive Overlay
                        </div>

                        <h3 className="mt-4 max-w-[13ch] text-[30px] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                          Lightweight right-edge access.
                        </h3>

                        <p className="mt-3 max-w-[36ch] text-[13px] leading-6 text-white/48">
                          Bu layer hover ilə açılır, arxadakı əsas səhnəni
                          dondurmur və səhifəyə ağır modal effekti vermir.
                        </p>
                      </div>

                      <div>
                        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                          Social Routes
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {SOCIALS.map((item) => (
                            <SocialCard key={item.label} {...item} />
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                          Quick Launch
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {QUICK_LINKS.map((item) => (
                            <QuickAction
                              key={item.label}
                              item={item}
                              onRailOpen={handleRailOpen}
                            />
                          ))}
                        </div>
                      </div>

                      <a
                        href="mailto:hello@example.com"
                        className="group relative flex items-center justify-between overflow-hidden rounded-[22px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] px-4 py-4"
                      >
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(220px_circle_at_0%_0%,rgba(34,211,238,0.08),transparent_42%)]" />

                        <div className="relative flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.04] text-white/82">
                            <Mail className="h-[17px] w-[17px]" />
                          </div>

                          <div>
                            <div className="text-[13px] font-semibold tracking-[0.05em] text-white/90">
                              Contact Layer
                            </div>
                            <div className="mt-1 text-[12px] text-white/42">
                              hello@example.com
                            </div>
                          </div>
                        </div>

                        <ArrowUpRight className="relative h-4 w-4 text-white/34 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/76" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}