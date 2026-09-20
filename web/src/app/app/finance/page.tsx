"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FinanceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/review");
  }, [router]);
  return null;
}
