/// <reference types="vite/client" />
import { createClient, type User } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Category = 'task' | 'meal' | 'event' | 'service' | 'trip' | 'medical' | 'run';
export type Item = { id: string; kind: Category; title: string; date: string; time: string; detail: string; cost: number; done: boolean; distanceKm?: number; durationMin?: number };
export type Settings = { name: string; mealTimes: string[]; weeklyBudget: number };
export type Data = { version: 1; items: Item[]; settings: Settings };
export const storageKey = 'vida-em-dia-v1';
export const defaultData: Data = { version: 1, items: [], settings: { name: '', mealTimes: ['07:30','12:30','19:30'], weeklyBudget: 500 } };
const kinds = ['task','meal','event','service','trip','medical','run'];
export function validData(x: unknown): x is Data {
  if (!x || typeof x !== 'object') return false;
  const v = x as Partial<Data>;
  return v.version === 1 && Array.isArray(v.items) && v.items.length <= 10000 && v.items.every(i =>
    i && typeof i.id === 'string' && kinds.includes(i.kind) && typeof i.title === 'string' && typeof i.date === 'string' && typeof i.time === 'string' && typeof i.detail === 'string' && typeof i.cost === 'number' && Number.isFinite(i.cost) && typeof i.done === 'boolean' &&
    (i.distanceKm === undefined || (typeof i.distanceKm === 'number' && Number.isFinite(i.distanceKm) && i.distanceKm > 0)) &&
    (i.durationMin === undefined || (typeof i.durationMin === 'number' && Number.isFinite(i.durationMin) && i.durationMin > 0))) &&
    !!v.settings && typeof v.settings.name === 'string' && Array.isArray(v.settings.mealTimes) && v.settings.mealTimes.every(t => typeof t === 'string') && typeof v.settings.weeklyBudget === 'number' && Number.isFinite(v.settings.weeklyBudget);
}
function readLocal(): Data { try { const value=JSON.parse(localStorage.getItem(storageKey) || 'null'); return validData(value) ? value : defaultData } catch { return defaultData } }
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && publishableKey ? createClient(url, publishableKey) : null;
type Row = { payload: Data; revision: number };

export function useDataSync() {
  const [data, setData] = useState<Data>(readLocal);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [status, setStatus] = useState(supabase ? 'Conectando…' : 'Salvo neste dispositivo');
  const [retry, setRetry] = useState(0);
  const revision = useRef(0);
  const baseline = useRef(JSON.stringify(readLocal()));
  const account = useRef<string | null>(null);
  const inFlight = useRef(false);
  const latest = useRef(data);
  latest.current=data;

  const load = useCallback(async (nextUser: User | null) => {
    if (!supabase) return;
    account.current = nextUser?.id ?? null;
    setReady(false);
    if (!nextUser) {
      const local = readLocal(); revision.current=0; baseline.current=JSON.stringify(local);
      setData(local); setUser(null); setStatus('Salvo neste dispositivo'); setReady(true); return;
    }
    setUser(nextUser); setStatus('Carregando da nuvem…');
    const {data:row,error}=await supabase.from('vida_em_dia_profiles').select('payload,revision').eq('user_id',nextUser.id).maybeSingle<Row>();
    if (account.current !== nextUser.id) return;
    if (error) { setStatus('Falha ao carregar. Recarregue a página.'); return }
    const local=readLocal();
    if (!row) {
      const initial=JSON.stringify(local).length <= 4_000_000 ? local : defaultData;
      const inserted=await supabase.from('vida_em_dia_profiles').insert({user_id:nextUser.id,payload:initial}).select('payload,revision').single<Row>();
      if (account.current !== nextUser.id) return;
      if (inserted.error) { setStatus('Falha ao iniciar a sincronização. Recarregue.'); return }
      revision.current=inserted.data.revision; baseline.current=JSON.stringify(initial); setData(initial);
      localStorage.removeItem(storageKey);
    } else {
      if (!validData(row.payload)) {setStatus('Dados remotos inválidos. Contate o suporte.'); return}
      revision.current=row.revision; baseline.current=JSON.stringify(row.payload); setData(row.payload);
      // Local data remains available as a JSON backup, but is never merged silently.
    }
    setStatus('Sincronizado na nuvem'); setReady(true);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let active=true;
    void supabase.auth.getUser().then(({data:{user},error}) => {
      if (!active) return;
      if (error) { setStatus('Falha de autenticação. Recarregue.'); return }
      if (account.current !== (user?.id ?? null) || !ready) void load(user);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session) => {
      if (!active || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
      if (account.current !== (session?.user.id ?? null)) void load(session?.user ?? null);
    });
    return () => {active=false;subscription.unsubscribe()};
  }, [load]);

  useEffect(() => {
    if (!ready) return;
    const serialized=JSON.stringify(data);
    if (!user) { localStorage.setItem(storageKey,serialized); baseline.current=serialized; return }
    if (serialized === baseline.current || !supabase) return;
    const owner=user.id;
    const timer=window.setTimeout(async () => {
      if (inFlight.current || account.current !== owner) {setRetry(n=>n+1);return}
      inFlight.current=true; setStatus('Salvando na nuvem…');
      const expected=revision.current;
      const result=await supabase.from('vida_em_dia_profiles').update({payload:data,revision:expected+1,updated_at:new Date().toISOString()})
        .eq('user_id',owner).eq('revision',expected).select('revision').maybeSingle<{revision:number}>();
      inFlight.current=false;
      if (account.current !== owner) return;
      if (result.error) {setStatus('Falha ao salvar. Tentando novamente…');window.setTimeout(()=>setRetry(n=>n+1),3000);return}
      if (!result.data) {setStatus('Conflito entre dispositivos. Exporte seus dados antes de recarregar.'); return}
      revision.current=result.data.revision; baseline.current=serialized; setStatus('Sincronizado na nuvem');
      if (JSON.stringify(latest.current)!==serialized) setRetry(n=>n+1);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [data,ready,user,retry]);

  useEffect(() => {
    if (!ready || !user || !supabase) return;
    const owner=user.id;
    const refresh=async () => {
      if (document.visibilityState === 'hidden' || inFlight.current || JSON.stringify(data)!==baseline.current) return;
      const {data:row,error}=await supabase!.from('vida_em_dia_profiles').select('payload,revision').eq('user_id',owner).maybeSingle<Row>();
      if (error || account.current!==owner || !row || row.revision<=revision.current || !validData(row.payload)) return;
      revision.current=row.revision; baseline.current=JSON.stringify(row.payload); setData(row.payload); setStatus('Atualizado da nuvem');
    };
    window.addEventListener('focus',refresh);
    const timer=window.setInterval(refresh,30000);
    return () => {window.removeEventListener('focus',refresh);window.clearInterval(timer)};
  }, [data,ready,user]);

  return {data,setData,user,ready,status,configured:!!supabase};
}
