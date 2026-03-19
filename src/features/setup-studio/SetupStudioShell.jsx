export default function SetupStudioShell({ children }) {
  return (
    <div className="setup-studio-shell">
      <div className="setup-studio-shell__wash" />
      <div className="setup-studio-shell__mesh" />
      <div className="setup-studio-shell__sweep" />
      <div className="setup-studio-shell__glow setup-studio-shell__glow--left" />
      <div className="setup-studio-shell__glow setup-studio-shell__glow--top" />
      <div className="setup-studio-shell__glow setup-studio-shell__glow--right" />
      <div className="setup-studio-shell__glow setup-studio-shell__glow--bottom" />

      <div className="setup-studio-shell__noise" />
      <div className="setup-studio-shell__content">{children}</div>
    </div>
  );
}