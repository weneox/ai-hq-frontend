import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { overlayTransition } from "./shared.js";

export default function SetupStudioModalLayer({
  open,
  zIndexClass = "z-[140]",
  backdropClass = "bg-slate-950/45 backdrop-blur-md",
  children,
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          className={`fixed inset-0 ${zIndexClass} overflow-y-auto overscroll-contain`}
        >
          <div className={`absolute inset-0 ${backdropClass}`} />
          <div className="relative z-[1] min-h-screen w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.985 }}
              transition={overlayTransition}
              className="mx-auto w-full max-w-[1380px] pointer-events-auto"
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}