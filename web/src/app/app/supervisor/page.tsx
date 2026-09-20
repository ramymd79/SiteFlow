"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SupervisorRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/review");
  }, [router]);
  return null;
}
