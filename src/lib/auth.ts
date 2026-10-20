import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "usuario" | "estabelecimento";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setRole(null);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .then(({ data }) => {
        const roles = (data ?? []).map((r) => r.role);
        setRole(roles.includes("estabelecimento") ? "estabelecimento" : "usuario");
      });
  }, [session]);

  return { session, user: session?.user ?? null, role, loading };
}

/** Converts stored photo references into displayable URLs (static or private storage). */
export async function resolvePhotos(paths: string[]): Promise<string[]> {
  const stored = paths.filter((p) => !p.startsWith("/") && !p.startsWith("http"));
  let signed: Record<string, string> = {};
  if (stored.length) {
    const { data } = await supabase.storage.from("space-photos").createSignedUrls(stored, 60 * 60);
    signed = Object.fromEntries((data ?? []).map((d) => [d.path ?? "", d.signedUrl]));
  }
  return paths.map((p) => signed[p] ?? p).filter(Boolean);
}
