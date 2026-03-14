import { ArrowRight, PackageMinus, PackagePlus } from "lucide-react";
import { Link } from "react-router-dom";

function OperationCard({
  title,
  description,
  points,
  badge,
  to,
  tone,
  Icon,
}) {
  return (
    <Link
      to={to}
      className={`group block rounded-2xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${tone.border} ${tone.bg}`}
      style={{ boxShadow: "var(--shadow-md)" }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone.badge}`}>
          {badge}
        </div>
        <div className={`rounded-lg p-2 ${tone.iconBg}`}>
          <Icon className={`h-5 w-5 ${tone.icon}`} />
        </div>
      </div>

      <h2 className="text-xl font-heading font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p>

      <ul className="mt-4 space-y-2 text-sm text-ink">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className={`mt-1 h-2 w-2 rounded-full ${tone.dot}`} />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${tone.link}`}>
        Open {title}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function Operations() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-6" style={{ boxShadow: "var(--shadow-md)" }}>
        <h1 className="text-3xl font-heading font-bold text-ink">Operations</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
          Manage stock movement with two core warehouse flows. Receipts add stock when goods come in from suppliers.
          Deliveries remove stock when goods leave for customers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <OperationCard
          title="Receipts"
          badge="Incoming Stock"
          to="/inventory/operations/receipts"
          Icon={PackagePlus}
          description="Use this for supplier-to-warehouse movement. Every receipt increases available quantity."
          points={[
            "Supplier to warehouse",
            "Stock IN (+ quantity)",
            "Reference pattern: WH/IN/0001",
          ]}
          tone={{
            border: "border-emerald-200",
            bg: "bg-emerald-50/50",
            badge: "bg-emerald-100 text-emerald-800",
            iconBg: "bg-emerald-100",
            icon: "text-emerald-700",
            dot: "bg-emerald-500",
            link: "text-emerald-800",
          }}
        />

        <OperationCard
          title="Deliveries"
          badge="Outgoing Stock"
          to="/inventory/operations/deliveries"
          Icon={PackageMinus}
          description="Use this for warehouse-to-customer movement. Every delivery decreases available quantity."
          points={[
            "Warehouse to customer",
            "Stock OUT (- quantity)",
            "Reference pattern: WH/OUT/0001",
          ]}
          tone={{
            border: "border-rose-200",
            bg: "bg-rose-50/50",
            badge: "bg-rose-100 text-rose-800",
            iconBg: "bg-rose-100",
            icon: "text-rose-700",
            dot: "bg-rose-500",
            link: "text-rose-800",
          }}
        />
      </div>

      <div className="rounded-2xl border border-line bg-surface-soft p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Simple Reminder</h3>
        <p className="mt-2 text-sm text-ink">
          Receipts = incoming stock (+) | Deliveries = outgoing stock (-)
        </p>
      </div>
    </div>
  );
}