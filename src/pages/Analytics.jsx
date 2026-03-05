import Card from "../components/ui/Card.jsx";
import GlobeCard from "../components/analytics/GlobeCard.jsx";

export default function Analytics() {
  return (
    <div className="space-y-6">

      {/* page header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-sm text-slate-500">
          Global activity, metrics və data vizualizasiya
        </p>
      </div>

      {/* globe analytics card */}
      <GlobeCard />

      {/* placeholder cards (gələcək üçün) */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-slate-500">Transactions</div>
          <div className="text-xl font-semibold mt-1">$1.28M</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-slate-500">Active routes</div>
          <div className="text-xl font-semibold mt-1">42</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-slate-500">Success rate</div>
          <div className="text-xl font-semibold mt-1">99.2%</div>
        </Card>
      </div>

    </div>
  );
}