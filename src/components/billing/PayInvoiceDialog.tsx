import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Lock } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateCard } from "@/lib/billing";
import type { Invoice } from "@/lib/data/types";

type Props = { invoice: Invoice | null; onClose: () => void; onPaid: (id: string) => void };

/** Authorize.Net placeholder checkout — demo only, no real charge. */
export function PayInvoiceDialog({ invoice, onClose, onPaid }: Props) {
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "", zip: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "processing" | "done">("form");

  const close = () => {
    setCard({ name: "", number: "", expiry: "", cvc: "", zip: "" });
    setErrors({});
    setStep("form");
    onClose();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateCard(card);
    setErrors(errs);
    if (Object.keys(errs).length || !invoice) return;
    setStep("processing");
    setTimeout(() => {
      onPaid(invoice.id);
      setStep("done");
    }, 1200);
  };
  const field = (key: keyof typeof card, label: string, placeholder: string, extra = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`pay-${key}`}>{label}</Label>
      <Input id={`pay-${key}`} value={card[key]} placeholder={placeholder} onChange={(e) => setCard({ ...card, [key]: e.target.value })} {...extra} />
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <Dialog open={!!invoice} onOpenChange={(o) => !o && step !== "processing" && close()}>
      <DialogContent className="sm:max-w-md">
        {invoice && step === "done" ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-3 text-lg font-semibold">Payment received</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {invoice.number} · ${invoice.amount.toLocaleString()} is now marked as paid.
            </p>
            <Button className="mt-5" onClick={close}>Done</Button>
          </div>
        ) : invoice ? (
          <>
            <DialogHeader>
              <DialogTitle>Pay {invoice.number}</DialogTitle>
              <DialogDescription>Secure checkout powered by Authorize.Net</DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Period</span><span>{invoice.period}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Due</span><span>{invoice.dueOn}</span></div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold"><span>Amount</span><span className="tabular-nums">${invoice.amount.toLocaleString()}</span></div>
            </div>
            <form className="space-y-3" onSubmit={submit}>
              {field("name", "Name on card", "Jordan Avery", { autoComplete: "cc-name" })}
              {field("number", "Card number", "4111 1111 1111 1111", { inputMode: "numeric", autoComplete: "cc-number" })}
              <div className="grid grid-cols-3 gap-3">
                {field("expiry", "Expiry", "MM/YY", { autoComplete: "cc-exp" })}
                {field("cvc", "CVC", "123", { inputMode: "numeric", autoComplete: "cc-csc" })}
                {field("zip", "ZIP", "10001", { autoComplete: "postal-code" })}
              </div>
              <Button type="submit" className="w-full" disabled={step === "processing"}>
                {step === "processing" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : <><Lock className="mr-2 h-4 w-4" /> Pay ${invoice.amount.toLocaleString()}</>}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Demo checkout — no card will be charged.</p>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
