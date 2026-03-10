import Card from "../components/ui/Card.jsx";
import TeamPanel from "../components/settings/TeamPanel.jsx";

export default function AdminTeam() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-1">
          <div className="text-xl font-semibold text-slate-900 dark:text-white">
            Admin · Team
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Workspace istifadəçilərini, rolları və statusları platform səviyyəsində idarə et.
          </div>
        </div>
      </Card>

      <TeamPanel canManage />
    </div>
  );
}