"use client";

import { useEffect, useState } from "react";
import { Plus, Receipt, Loader2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { money } from "@/lib/utils/billing";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RoleGate } from "@/components/auth/RoleGate";

const EXPENSE_CATEGORIES = ['Rent', 'Salary', 'Electricity', 'Gas', 'Maintenance', 'Miscellaneous'];

type Expense = {
  id: string;
  category: string;
  amount: number;
  expense_date: string;
  notes: string | null;
  receipt_url: string | null;
};

export function ExpenseManager() {
  const { currentUser } = useAuth();
  const supabase = createClient();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  useEffect(() => {
    if (!currentUser?.restaurant_id) return;
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, filterMonth]);

  async function loadExpenses() {
    setLoading(true);
    
    // Simple filter by month (starts with YYYY-MM)
    const startDate = `${filterMonth}-01`;
    const lastDay = new Date(Number(filterMonth.split('-')[0]), Number(filterMonth.split('-')[1]), 0).getDate();
    const endDate = `${filterMonth}-${lastDay}`;
    
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("restaurant_id", currentUser?.restaurant_id)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });
      
    if (data) {
      setExpenses(data);
    }
    setLoading(false);
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser?.restaurant_id) return;
    setSaving(true);
    
    const { data, error } = await supabase.from("expenses").insert({
      restaurant_id: currentUser.restaurant_id,
      category,
      amount: Number(amount),
      expense_date: date,
      notes,
      created_by: currentUser.id,
    }).select().single();

    if (error) {
      alert("Failed to save expense: " + error.message);
    } else if (data) {
      // Check if it belongs to current filter month
      if (data.expense_date.startsWith(filterMonth)) {
        setExpenses([data, ...expenses]);
      }
      setAmount("");
      setNotes("");
    }
    
    setSaving(false);
  }
  
  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  }

  const filtered = expenses.filter(e => 
    e.category.toLowerCase().includes(search.toLowerCase()) || 
    (e.notes || "").toLowerCase().includes(search.toLowerCase())
  );
  
  const totalExpenses = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <RoleGate allowedRoles={['admin']} fallback={<div className="p-4 text-center">Admin access required to manage expenses.</div>}>
      <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
        <Card className="h-fit overflow-hidden bg-white">
          <CardHeader className="bg-slate-950 text-slate-900">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-300">Bookkeeping</p>
            <CardTitle className="text-2xl font-black">Log an expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <form onSubmit={handleAddExpense} className="space-y-4">
              <Select required value={category} onChange={e => setCategory(e.target.value)} className="h-12 rounded-2xl bg-white">
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              
              <div className="grid grid-cols-2 gap-3">
                <Input required value={amount} onChange={e => setAmount(e.target.value)} className="h-12 rounded-2xl bg-white" type="number" step="0.01" placeholder="Amount ($)" />
                <Input required value={date} onChange={e => setDate(e.target.value)} className="h-12 rounded-2xl bg-white" type="date" />
              </div>
              
              <Input value={notes} onChange={e => setNotes(e.target.value)} className="h-12 rounded-2xl bg-white" placeholder="Notes (e.g. Supplier name)" />
              
              <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                <Receipt className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                Receipt attachment (Coming soon)
              </div>
              
              <Button type="submit" disabled={saving} className="min-h-14 w-full text-base">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                <span className="ml-2">Save expense</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 soft-shadow">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-700" />
                <Input value={search} onChange={e => setSearch(e.target.value)} className="h-14 rounded-2xl bg-white pl-12 text-base font-semibold" placeholder="Search expenses..." />
              </label>
              <Input value={filterMonth} onChange={e => setFilterMonth(e.target.value)} type="month" className="h-14 rounded-2xl bg-white text-base font-semibold text-center" />
            </div>
            
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 p-4 border border-slate-800">
              <span className="font-bold text-slate-400">Total for Period</span>
              <span className="text-xl font-black text-slate-900">{money(totalExpenses, "$")}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 food-card-shadow">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-blue-700">
                      <Receipt className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{item.category}</h3>
                      <p className="text-sm font-semibold text-slate-400/70">
                        {new Date(item.expense_date).toLocaleDateString()} {item.notes && `• ${item.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-red-600">-{money(item.amount, "$")}</span>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-10 text-center text-gray-500 font-medium">No expenses logged for this period.</div>
              )}
            </div>
          )}
        </section>
      </div>
    </RoleGate>
  );
}
