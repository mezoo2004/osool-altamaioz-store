"use client";

import { useTranslations } from "next-intl";
import { getPaymentTrustMethods } from "@/lib/commerce/payment-trust-methods";

function BankTransferMark({ label }: { label: string }) {
  return (
    <div className="flex w-full max-w-[88%] flex-col items-center justify-center gap-1.5 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-8 w-8 shrink-0 text-brand-black-soft"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M12 3 2 9v2h20V9L12 3zm0 2.18L18.82 10H5.18L12 5.18zM4 13v6h3v-4h10v4h3v-6H4z"
        />
      </svg>
      <span className="text-[10px] font-semibold leading-tight tracking-wide text-brand-black-soft sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}

export function PaymentTrustSection() {
  const t = useTranslations("home.paymentTrust");
  const methods = getPaymentTrustMethods();

  return (
    <section className="border-y border-border/60 bg-[#FAF8F5] py-10 md:py-12" aria-labelledby="payment-trust-heading">
      <div className="container-home">
        <div className="relative rounded-2xl border border-brand-black-soft/25 bg-white px-4 py-8 shadow-[0_8px_32px_rgba(8,8,8,0.04)] sm:px-6 md:px-10">
          <div className="mb-8 flex items-center gap-4">
            <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />
            <h2 id="payment-trust-heading" className="text-center text-sm font-semibold tracking-wide text-brand-black-soft md:text-base">
              {t("title")}
            </h2>
            <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />
          </div>

          <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {methods.map((method) => (
              <li
                key={method.id}
                className="flex w-[calc(50%-0.375rem)] min-h-[4.75rem] max-w-[8.25rem] flex-col items-center justify-center rounded-xl border border-border/70 bg-[#FDFCFB] px-3 py-4 transition duration-200 hover:-translate-y-px hover:border-brand-black-soft/35 hover:shadow-[0_4px_14px_rgba(8,8,8,0.06)] sm:min-h-[5rem] sm:w-[calc(33.333%-0.67rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)]"
              >
                <div className="grid h-12 w-full place-items-center sm:h-[3.25rem]">
                  {method.presentation === "bank-transfer" ? (
                    <BankTransferMark label={t("methods.bank-transfer")} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- crisp local SVG brand marks
                    <img
                      src={method.logoSrc!}
                      alt=""
                      decoding="async"
                      className={`block shrink-0 object-contain object-center ${method.logoClassName ?? "h-[2.75rem] w-auto max-w-[4.85rem]"}`}
                    />
                  )}
                </div>
                {method.presentation === "logo" ? <span className="sr-only">{t(`methods.${method.id}`)}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
