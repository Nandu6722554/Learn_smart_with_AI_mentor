import { supabase } from "./supabase";

// ── Profile ────────────────────────────────────────────
export async function getProfile(userId) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function addXP(userId, amount) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .single();
  const newXP = (profile?.xp || 0) + amount;
  await supabase.from("profiles").update({ xp: newXP }).eq("id", userId);
  return newXP;
}

// ── Topics ─────────────────────────────────────────────
export async function saveTopic(userId, topic, level) {
  await supabase.from("topics").upsert({
    user_id: userId,
    topic,
    level,
    learned_at: new Date().toISOString(),
  }, { onConflict: "user_id,topic" });
  return addXP(userId, 50);
}

export async function getTopics(userId) {
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("user_id", userId)
    .order("learned_at", { ascending: false })
    .limit(20);
  return data || [];
}

// ── Quiz History ───────────────────────────────────────
export async function saveQuizResult(userId, topic, score, total, weakAreas) {
  const pct = Math.round((score / total) * 100);
  await supabase.from("quiz_history").insert({
    user_id: userId,
    topic,
    score,
    total,
    pct,
    weak_areas: weakAreas || [],
  });
  // save weak areas to profile
  if (weakAreas?.length) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("weak_areas")
      .eq("id", userId)
      .single();
    const merged = [...new Set([...(profile?.weak_areas || []), ...weakAreas])].slice(0, 15);
    await supabase.from("profiles").update({ weak_areas: merged }).eq("id", userId);
  }
  return addXP(userId, score * 20);
}

export async function getQuizHistory(userId) {
  const { data } = await supabase
    .from("quiz_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}

// ── Practice ───────────────────────────────────────────
export async function recordPractice(userId) {
  await supabase.from("profiles")
    .update({ practice_count: supabase.rpc("increment", { x: 1 }) })
    .eq("id", userId);
  return addXP(userId, 30);
}
