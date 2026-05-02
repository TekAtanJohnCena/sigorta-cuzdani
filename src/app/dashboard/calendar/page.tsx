"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getPoliciesByTenant } from "@/lib/firebase/firestore";
import { Policy } from "@/types/policy";
import { CalendarEvent } from "@/types/finance";
import { getMonthName, getDaysInMonth, getFirstDayOfMonth, formatDateShort } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/currency";
import { useDemo } from "@/lib/context/DemoContext";
import { MOCK_POLICIES } from "@/lib/mockData";

const EVENT_TYPE_MAP = {
  expiry: { label: "Vade Sonu", color: "expiry", icon: "🔴" },
  payment: { label: "Taksit Ödemesi", color: "payment", icon: "🟡" },
  renewal: { label: "Yenileme", color: "renewal", icon: "🟢" },
  reminder: { label: "Hatırlatma", color: "renewal", icon: "🔵" },
};

export default function CalendarPage() {
  const { appUser, loading: authLoading } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { isDemoMode } = useDemo();

  useEffect(() => {
    async function loadData() {
      if (isDemoMode) {
        setLoading(false);
        return;
      }
      if (!appUser) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPoliciesByTenant(appUser.tenantId);
        setPolicies(data as unknown as Policy[]);
      } catch (err) {
        console.error("Failed to load policies", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading) {
      loadData();
    }
  }, [appUser, authLoading, isDemoMode]);

  const effectivePolicies = isDemoMode ? MOCK_POLICIES : policies;

  // Generate calendar events dynamically from actual policies
  const events = useMemo(() => {
    const dynamicEvents: CalendarEvent[] = [];
    effectivePolicies.filter(p => p.status === 'active').forEach(p => {
      // 1. Expiry date event
      if (p.endDate) {
        dynamicEvents.push({
          id: `exp-${p.id}`,
          date: p.endDate,
          type: "expiry",
          title: `${p.insuranceCompany} - ${p.policyType.toUpperCase()} Poliçesi Vadesi`,
          policyId: p.id,
          policyNumber: p.policyNumber,
          insuranceCompany: p.insuranceCompany,
        });
      }

      // 2. Installments events
      if (p.premium.installments && p.premium.installments.length > 0) {
        p.premium.installments.forEach((inst, idx) => {
          if (inst.dueDate && inst.status !== 'paid') {
            dynamicEvents.push({
              id: `inst-${p.id}-${inst.id}`,
              date: inst.dueDate,
              type: "payment",
              title: `${p.insuranceCompany} Taksit ${idx + 1}/${p.premium.installments!.length}`,
              policyId: p.id,
              policyNumber: p.policyNumber,
              amount: inst.amount,
              insuranceCompany: p.insuranceCompany,
            });
          }
        });
      } else if (p.premium.paymentType === 'cash' && p.startDate) {
        // If cash but not marked paid, maybe create one payment event? We can assume cash is paid upfront, so ignore.
      }
    });

    return dynamicEvents;
  }, [effectivePolicies]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );

  const goPrev = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goNext = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((evt) => evt.date.startsWith(dateStr));
  };

  const allMonthEvents = events.filter((evt) => {
    const d = new Date(evt.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // Build calendar cells
  const cells: { day: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }

  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false });
  }

  const selectedEvents = selectedDate
    ? events.filter((evt) => evt.date.startsWith(selectedDate))
    : [];

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p style={{ color: "var(--text-tertiary)" }}>Takvim yükleniyor...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="page-title">Vade Takvimi</h1>
        <p className="page-subtitle">
          Poliçe bitiş tarihleri ve taksit ödemeleri ({events.length} etkinlik)
        </p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 340px" }}>
        {/* Calendar Grid */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          {/* Month Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
            <button className="btn btn-ghost btn-icon" onClick={goPrev}>◁</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
                {getMonthName(currentMonth)} {currentYear}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                {allMonthEvents.length} etkinlik
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={goNext}>▷</button>
          </div>

          {/* Calendar */}
          <div className="calendar-grid">
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
              <div key={d} className="calendar-header-cell">{d}</div>
            ))}

            {cells.map((cell, idx) => {
              const dayEvents = cell.isCurrentMonth ? getEventsForDate(cell.day) : [];
              const isToday =
                cell.isCurrentMonth &&
                cell.day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              const dateStr = cell.isCurrentMonth
                ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`
                : null;
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={idx}
                  className={`calendar-cell ${!cell.isCurrentMonth ? "other-month" : ""} ${isToday ? "today" : ""}`}
                  style={{
                    cursor: cell.isCurrentMonth ? "pointer" : "default",
                    outline: isSelected ? "2px solid var(--primary-500)" : "none",
                    outlineOffset: -2,
                  }}
                  onClick={() => dateStr && setSelectedDate(dateStr)}
                >
                  <div className={`calendar-day-number`}>
                    {isToday ? (
                      <span style={{ background: "var(--primary-500)", color: "white", borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        {cell.day}
                      </span>
                    ) : (
                      cell.day
                    )}
                  </div>
                  {dayEvents.map((evt) => (
                    <div key={evt.id} className={`calendar-event ${EVENT_TYPE_MAP[evt.type].color}`} title={evt.title}>
                      {evt.title.substring(0, 18)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "var(--space-6)", marginTop: "var(--space-4)", justifyContent: "center" }}>
            {Object.entries(EVENT_TYPE_MAP).map(([key, meta]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — Events List */}
        <div>
          {selectedDate && selectedEvents.length > 0 ? (
            <div className="card animate-fade-in" style={{ marginBottom: "var(--space-4)" }}>
              <div className="card-title" style={{ marginBottom: "var(--space-3)" }}>📅 {formatDateShort(selectedDate)}</div>
              {selectedEvents.map((evt) => (
                <div key={evt.id} style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--neutral-50)", marginBottom: "var(--space-2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <span>{EVENT_TYPE_MAP[evt.type].icon}</span>
                    <span style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{evt.title}</span>
                  </div>
                  {evt.insuranceCompany && (
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 4, marginLeft: 24 }}>
                      {evt.insuranceCompany} {evt.policyNumber && ` · ${evt.policyNumber}`}
                    </div>
                  )}
                  {evt.amount && (
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginTop: 4, marginLeft: 24 }}>
                      {formatCurrency(evt.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ marginBottom: "var(--space-4)", textAlign: "center", padding: "var(--space-6)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>📅</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>Detay görmek için takvimden gün seçin</div>
            </div>
          )}

          <div className="card">
            <div className="card-title" style={{ marginBottom: "var(--space-4)" }}>📋 Yaklaşan Etkinlikler</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxHeight: "400px", overflowY: "auto" }}>
              {events
                .filter(e => new Date(e.date) >= today)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 10)
                .map((evt) => (
                  <div key={evt.id} className="alert-item" onClick={() => {
                    const dateObj = new Date(evt.date);
                    setCurrentYear(dateObj.getFullYear());
                    setCurrentMonth(dateObj.getMonth());
                    setSelectedDate(evt.date.substring(0, 10)); // YYYY-MM-DD
                  }} style={{ cursor: "pointer" }}>
                    <div className={`alert-item-dot ${evt.type === "expiry" ? "critical" : "warning"}`} />
                    <div className="alert-item-content">
                      <div className="alert-item-text">{evt.title}</div>
                      <div className="alert-item-time">
                        {formatDateShort(evt.date)}
                        {evt.amount && ` · ${formatCurrency(evt.amount)}`}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
