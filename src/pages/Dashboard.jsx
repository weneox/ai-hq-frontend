import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Today</div>
          <div className="mt-1 text-2xl font-semibold">7</div>
          <div className="mt-2"><Badge tone="info">Proposals created</Badge></div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Queue</div>
          <div className="mt-1 text-2xl font-semibold">2</div>
          <div className="mt-2"><Badge tone="warn">Pending approvals</Badge></div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Executions</div>
          <div className="mt-1 text-2xl font-semibold">94%</div>
          <div className="mt-2"><Badge tone="success">Success rate</Badge></div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="text-sm font-semibold">Activity Timeline</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Sprint 2-də realtime WS events burda timeline kimi görünəcək.
        </div>
      </Card>
    </div>
  );
}