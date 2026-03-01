import { cx } from "../../lib/cx.js";

export default function Input({ className, ...props }) {
  return (
    <input
      className={cx(
        "w-full h-10 rounded-lg px-3 text-sm",
        "border border-slate-200 bg-white",
        "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none",
        "dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100",
        className
      )}
      {...props}
    />
  );
}