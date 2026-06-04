import { ExpenseManager } from "@/components/expenses/ExpenseManager";

export default function ExpensesPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 glass-panel p-5 soft-shadow">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-500">Financials</p>
        <h1 className="mt-1 text-3xl font-black text-white">Expense tracking</h1>
        <p className="mt-2 text-base font-semibold text-slate-300/70">Log daily expenses, bills, and track outflows.</p>
      </div>
      <ExpenseManager />
    </div>
  );
}
