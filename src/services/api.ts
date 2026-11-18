import { supabase } from "../lib/supabase";

export type Torneo = {
  id: number;
  slug: string;
  titolo: string;
  data: string;
  luogo: string;
  quota: number;
  posti_totali: number;
  occupati: number;
};

export type Iscrizione = {
  id: number;
  created_at: string;
  torneo_id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  torneo_titolo: string;
};

export type NuovaIscrizione = {
  torneo_id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
};

/* ---------- Tornei ---------- */

export async function listTornei(): Promise<Torneo[]> {
  const [tornei, occupati] = await Promise.all([
    supabase.from("tornei").select("*").order("data"),
    supabase.rpc("posti_occupati"),
  ]);
  if (tornei.error) throw tornei.error;
  if (occupati.error) throw occupati.error;

  const mappa = new Map<number, number>(
    (occupati.data ?? []).map((o: { torneo_id: number; occupati: number }) => [
      Number(o.torneo_id),
      Number(o.occupati),
    ]),
  );

  return (tornei.data ?? []).map((t) => ({
    ...t,
    quota: Number(t.quota),
    occupati: mappa.get(t.id) ?? 0,
  }));
}

export async function salvaTorneo(
  t: Pick<Torneo, "id" | "titolo" | "data" | "luogo" | "quota" | "posti_totali">,
) {
  const { error } = await supabase
    .from("tornei")
    .update({
      titolo: t.titolo,
      data: t.data,
      luogo: t.luogo,
      quota: t.quota,
      posti_totali: t.posti_totali,
    })
    .eq("id", t.id);
  if (error) throw error;
}

export async function creaTorneo() {
  const { error } = await supabase.from("tornei").insert({
    slug: `torneo-${Date.now()}`,
    titolo: "Nuovo torneo",
    data: "2026-12-19",
    luogo: "Milano",
    quota: 10,
    posti_totali: 16,
  });
  if (error) throw error;
}

/* ---------- Iscrizioni ---------- */

export async function creaIscrizione(i: NuovaIscrizione) {
  const { error } = await supabase
    .from("iscrizioni")
    .insert({ ...i, privacy_accettata: true });
  if (error) throw error;
}

export async function listIscrizioni(): Promise<Iscrizione[]> {
  const { data, error } = await supabase
    .from("iscrizioni")
    .select("*, tornei(titolo)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    created_at: r.created_at,
    torneo_id: r.torneo_id,
    nome: r.nome,
    cognome: r.cognome,
    email: r.email,
    telefono: r.telefono,
    torneo_titolo: r.tornei?.titolo ?? "—",
  }));
}

export async function eliminaIscrizione(id: number) {
  const { error } = await supabase.from("iscrizioni").delete().eq("id", id);
  if (error) throw error;
}

export async function svuotaIscrizioni() {
  const { error } = await supabase.from("iscrizioni").delete().gt("id", 0);
  if (error) throw error;
}

/* ---------- Login admin ---------- */

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function sessioneAttiva(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}
