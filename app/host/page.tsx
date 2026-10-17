"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLanguage } from "@/components/language-provider";
import { getPublicSupabase } from "@/lib/supabase";

type Signup = { id: string; full_name: string; phone: string; contact_channel: string; neighborhood: string | null; materials: string[]; created_at: string; contacted_at: string | null };

export default function HostPage() {
  const { t, language } = useLanguage();
  const supabase = getPublicSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadSignups = useCallback(async (id: string) => {
    if (!supabase) return;
    setLoading(true);
    const access = await supabase.from("host_users").select("user_id").eq("user_id", id).maybeSingle();
    if (access.error || !access.data) {
      setIsHost(false);
      setSignups([]);
      setMessage(language === "mk" ? "Овој профил нема пристап до листата." : "This account does not have access to the list.");
      setLoading(false);
      return;
    }
    setIsHost(true);
    const result = await supabase.from("interest_signups").select("id,full_name,phone,contact_channel,neighborhood,materials,created_at,contacted_at").order("created_at", { ascending: false });
    if (result.error) setMessage(language === "mk" ? "Не може да се вчита листата во моментов." : "The list could not be loaded right now.");
    else { setSignups((result.data ?? []) as Signup[]); setMessage(""); }
    setLoading(false);
  }, [language, supabase]);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session) { setUserId(data.session.user.id); void loadSignups(data.session.user.id); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setIsHost(false);
      if (session?.user.id) void loadSignups(session.user.id);
      else { setSignups([]); setMessage(""); }
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [loadSignups, supabase]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) { setMessage(language === "mk" ? "Автентикацијата не е конфигурирана." : "Authentication is not configured."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    setMessage(error ? (language === "mk" ? "Најавата не успеа. Провери ги податоците." : "Sign-in failed. Check your credentials.") : "");
  }

  async function markContacted(id: string) {
    if (!supabase || !window.confirm(language === "mk" ? "Потврди дека лицето веќе е контактирано еднаш." : "Confirm that this person has already been contacted once.")) return;
    const { error } = await supabase.rpc("mark_interest_contacted_once", { p_signup_id: id });
    if (error) setMessage(language === "mk" ? "Не може да се означи. Можеби веќе е контактирано." : "Could not mark this record. It may already be contacted.");
    else if (userId) void loadSignups(userId);
  }

  async function deleteSignup(id: string) {
    if (!supabase || !window.confirm(language === "mk" ? "Трајно да ја избришеме оваа пријава?" : "Permanently delete this signup?")) return;
    const { error } = await supabase.from("interest_signups").delete().eq("id", id);
    if (error) setMessage(language === "mk" ? "Пријавата не може да се избрише." : "Could not delete this signup.");
    else setSignups((current) => current.filter((item) => item.id !== id));
  }

  const materialName: Record<string, string> = { paper: t("paper"), plastic: t("plastic"), glass: t("glass"), metal: t("metal"), organics: t("organics") };
  return <div className="page-shell host-shell"><section className="page-intro"><span className="eyebrow">{language === "mk" ? "УПРАВУВАЊЕ СО ПРИЈАВИ" : "SIGNUP MANAGEMENT"}</span><h1>{t("hostTitle")}</h1><p>{t("hostIntro")}</p></section>
    {!userId ? <form className="host-login" onSubmit={signIn}><h2>{t("signInRequired")}</h2><label>{t("email")}<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>{t("password")}<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{message && <p className="form-error" role="alert">{message}</p>}<button className="button button-dark" disabled={loading}>{loading ? t("submitting") : t("signIn")} ↗</button></form> : <section className="host-list"><div className="host-list-heading"><div><span className="eyebrow">{t("signups")}</span><h2>{signups.length}</h2></div><button type="button" className="button button-light" onClick={() => void supabase?.auth.signOut()}>{t("signOut")} ↗</button></div>{message && <p className="host-message" role="status">{message}</p>}{!isHost ? <div className="empty-state"><span className="empty-icon">⌁</span><h2>{language === "mk" ? "Нема пристап" : "Access not approved"}</h2><p>{message}</p></div> : loading ? <p>{language === "mk" ? "Се вчитуваат пријавите…" : "Loading signups…"} <span className="spinner" /></p> : signups.length === 0 ? <div className="empty-state"><h2>{t("noSignups")}</h2></div> : <div className="signup-cards">{signups.map((signup) => <article className="signup-card" key={signup.id}><div className="signup-card-main"><div><span className="signup-date">{new Intl.DateTimeFormat(language === "mk" ? "mk-MK" : "en-GB", { dateStyle: "medium" }).format(new Date(signup.created_at))}</span><h3>{signup.full_name}</h3></div>{signup.contacted_at && <span className="freshness">✓ {t("contacted")}</span>}</div><p><a href={`tel:${signup.phone}`}>{signup.phone}</a> · {signup.contact_channel}</p><p>{signup.neighborhood ?? (language === "mk" ? "Населба не е наведена" : "No neighborhood specified")}</p><div className="material-tags">{signup.materials.map((item) => <span key={item}>{materialName[item] ?? item}</span>)}</div><div className="signup-actions">{!signup.contacted_at && <button type="button" className="button button-dark" onClick={() => void markContacted(signup.id)}>{t("markContacted")}</button>}<button type="button" className="delete-link" onClick={() => void deleteSignup(signup.id)}>{t("deleteSignup")}</button></div></article>)}</div>}<p className="privacy-note">{t("dataPrivacy")}</p></section>}
  </div>;
}
