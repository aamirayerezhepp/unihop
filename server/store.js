/* Where usage limits are counted.
   Firestore (the project's existing database, free Spark quotas) keeps counts across restarts — Render's free
   service sleeps after 15 idle minutes, so counts kept only in memory would reset. Without a service account the
   server falls back to memory and says so in /health. */

export function firestoreStore(db, FieldValue){
  return {
    kind:'firestore',
    async reserve({uid, ipHash, day, month, at, cfg}){
      const uRef = db.doc(`koyan_limits/u_${uid}`), iRef = db.doc(`koyan_limits/ip_${ipHash}`);
      const dRef = db.doc(`koyan_usage/d_${day}`), mRef = db.doc(`koyan_usage/m_${month}`);
      return db.runTransaction(async tx => {
        const [u, i, d, m] = await Promise.all([tx.get(uRef), tx.get(iRef), tx.get(dRef), tx.get(mRef)]);
        const ud = u.data() || {}, id = i.data() || {}, dd = d.data() || {}, md = m.data() || {};
        const locks = (ud.locks || []).filter(t => t > at);
        if ((dd.tokens || 0) >= cfg.dailyTokenCap || (md.tokens || 0) >= cfg.monthlyTokenCap || (cfg.monthlyUsdCap > 0 && (md.costMicro || 0) >= cfg.monthlyUsdCap * 1e6)) return {ok:false, code:'budget'};
        if (locks.length >= cfg.maxConcurrent) return {ok:false, code:'concurrent'};
        const uCount = ud.day === day ? ud.count || 0 : 0, iCount = id.day === day ? id.count || 0 : 0;
        if (uCount >= cfg.userDaily || iCount >= cfg.ipDaily) return {ok:false, code:'limit'};
        tx.set(uRef, {day, count:uCount + 1, locks:[...locks, at + cfg.lockMs]});
        tx.set(iRef, {day, count:iCount + 1});
        return {ok:true};
      });
    },
    async release({uid, day, month, tokens, costMicro, at}){
      const uRef = db.doc(`koyan_limits/u_${uid}`);
      await db.runTransaction(async tx => {
        const u = await tx.get(uRef), ud = u.data() || {};
        const locks = ud.locks || [], i = locks.findIndex(t => t > at);
        if (i >= 0) locks.splice(i, 1);
        tx.set(uRef, {...ud, locks});
      });
      const inc = {tokens:FieldValue.increment(tokens), costMicro:FieldValue.increment(costMicro), requests:FieldValue.increment(1)};
      await Promise.all([db.doc(`koyan_usage/d_${day}`).set(inc, {merge:true}), db.doc(`koyan_usage/m_${month}`).set(inc, {merge:true})]);
    }
  };
}

export function memoryStore(){
  const users = new Map(), ips = new Map(), usage = new Map();
  const get = (m, k, init) => { if (!m.has(k)) m.set(k, init()); return m.get(k); };
  return {
    kind:'memory',
    async reserve({uid, ipHash, day, month, at, cfg}){
      const d = get(usage, 'd_' + day, () => ({tokens:0, costMicro:0})), m = get(usage, 'm_' + month, () => ({tokens:0, costMicro:0}));
      if (d.tokens >= cfg.dailyTokenCap || m.tokens >= cfg.monthlyTokenCap || (cfg.monthlyUsdCap > 0 && m.costMicro >= cfg.monthlyUsdCap * 1e6)) return {ok:false, code:'budget'};
      const u = get(users, uid, () => ({day, count:0, locks:[]})), ip = get(ips, ipHash, () => ({day, count:0}));
      if (u.day !== day) Object.assign(u, {day, count:0});
      if (ip.day !== day) Object.assign(ip, {day, count:0});
      u.locks = u.locks.filter(t => t > at);
      if (u.locks.length >= cfg.maxConcurrent) return {ok:false, code:'concurrent'};
      if (u.count >= cfg.userDaily || ip.count >= cfg.ipDaily) return {ok:false, code:'limit'};
      u.count++; ip.count++; u.locks.push(at + cfg.lockMs);
      return {ok:true};
    },
    async release({uid, day, month, tokens, costMicro, at}){
      const u = users.get(uid);
      if (u) { const i = u.locks.findIndex(t => t > at); if (i >= 0) u.locks.splice(i, 1); }
      for (const k of ['d_' + day, 'm_' + month]) { const x = get(usage, k, () => ({tokens:0, costMicro:0})); x.tokens += tokens; x.costMicro += costMicro; }
    }
  };
}
