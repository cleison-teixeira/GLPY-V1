/**
 * GLPY — Debug de acesso em tela (mobile-friendly)
 * Sprint 17B.5.8
 *
 * Ativar: glpy.com.br?debug=access
 * Nunca mostrar em produção sem o parâmetro.
 */

import { useEffect, useState } from 'react';
import { auth } from '../firebase.js';
import { db } from '../firebase.js';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { hasActiveAccess } from '../core/accessControl';

const isActive =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debug') === 'access';

interface Row {
  label: string;
  value: string;
  ok?: boolean | null; // true=verde, false=vermelho, null=laranja
}

function buildRows(
  authEmail: string | null,
  uid: string | null,
  docExists: boolean | null,
  docError: string | null,
  planoTipo: string | null,
  planoStatus: string | null,
  planoOrigem: string | null,
  dataExpiracao: string | null,
  dataExpiracaoExpired: boolean | null,
  localStoragePlano: string | null,
  hasAccess: boolean,
  routeDest: string,
  adminGrantFound: boolean | null,
  adminGrantPlano: string | null,
  adminGrantStatus: string | null,
  adminGrantError: string | null,
): Row[] {
  return [
    { label: 'authEmail', value: authEmail ?? '— (não autenticado)', ok: !!authEmail },
    { label: 'uid', value: uid ?? '—', ok: !!uid },
    { label: 'firestoreUserDocExists', value: docError ? `ERRO: ${docError}` : String(docExists), ok: docError ? false : !!docExists },
    { label: 'firestorePlanoTipo', value: planoTipo ?? '— (sem campo)', ok: !!planoTipo && planoTipo !== 'starter' },
    { label: 'firestorePlanoStatus', value: planoStatus ?? '—', ok: planoStatus === 'active' },
    { label: 'firestorePlanoOrigem', value: planoOrigem ?? '—', ok: null },
    { label: 'firestoreDataExpiracao', value: dataExpiracao ?? '—', ok: dataExpiracaoExpired === false },
    { label: 'dataExpiracaoExpired', value: dataExpiracaoExpired === null ? '—' : String(dataExpiracaoExpired), ok: dataExpiracaoExpired === false },
    { label: 'adminGrantFound', value: adminGrantError ? `ERRO: ${adminGrantError}` : String(adminGrantFound), ok: adminGrantError ? false : (adminGrantFound ?? null) },
    { label: 'adminGrantPlano', value: adminGrantPlano ?? '—', ok: null },
    { label: 'adminGrantStatus', value: adminGrantStatus ?? '—', ok: adminGrantStatus === 'active' },
    { label: 'localStoragePlano', value: localStoragePlano ?? '— (null)', ok: !!localStoragePlano && localStoragePlano !== 'starter' },
    { label: 'hasActiveAccessResult', value: String(hasAccess), ok: hasAccess },
    { label: 'routeDestination', value: routeDest, ok: routeDest === 'dashboard' || routeDest === 'onboarding' },
  ];
}

export default function AccessDebugOverlay() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    (async () => {
      const user = auth.currentUser;
      const uid = user?.uid ?? null;
      const authEmail = user?.email ?? null;

      let docExists: boolean | null = null;
      let docError: string | null = null;
      let planoTipo: string | null = null;
      let planoStatus: string | null = null;
      let planoOrigem: string | null = null;
      let dataExpiracao: string | null = null;
      let dataExpiracaoExpired: boolean | null = null;

      if (uid) {
        try {
          const snap = await getDoc(doc(db, 'users', uid));
          docExists = snap.exists();
          if (snap.exists()) {
            const d = snap.data();
            const plano = d.plano;
            if (plano && typeof plano === 'object') {
              const p = plano as Record<string, unknown>;
              planoTipo = typeof p.tipo === 'string' ? p.tipo.trim().toLowerCase() : null;
              planoStatus = typeof p.status === 'string' ? p.status : null;
              planoOrigem = (typeof p.origem === 'string' ? p.origem : null)
                ?? (typeof p.liberadoPor === 'string' ? p.liberadoPor : null)
                ?? null;
              const expTs = p.dataExpiracao as { toDate?: () => Date } | null | undefined;
              if (expTs?.toDate) {
                const exp = expTs.toDate();
                dataExpiracao = exp.toLocaleDateString('pt-BR') + ' ' + exp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                dataExpiracaoExpired = exp < new Date();
              } else if (p.dataExpiracao === null || p.dataExpiracao === undefined) {
                dataExpiracao = 'null (vitalício)';
                dataExpiracaoExpired = false;
              }
            } else if (typeof plano === 'string') {
              planoTipo = plano.trim().toLowerCase();
              planoStatus = 'string-legado';
              dataExpiracaoExpired = false;
            }
          }
        } catch (e) {
          docError = (e as Error).message.slice(0, 60);
        }
      }

      let adminGrantFound: boolean | null = null;
      let adminGrantPlano: string | null = null;
      let adminGrantStatus: string | null = null;
      let adminGrantError: string | null = null;

      if (authEmail) {
        try {
          const gs = await getDocs(
            query(
              collection(db, 'admin_grants'),
              where('email', '==', authEmail.toLowerCase()),
              limit(10),
            )
          );
          const active = gs.docs.map(d => d.data()).find(g => {
            if (g.status !== 'active') return false;
            const exp = g.dataExpiracao as { toDate?: () => Date } | null | undefined;
            return exp?.toDate ? exp.toDate() >= new Date() : true;
          });
          adminGrantFound = !!active;
          adminGrantPlano = active?.plano ?? null;
          adminGrantStatus = active?.status ?? null;
        } catch (e) {
          adminGrantError = (e as Error).message.slice(0, 60);
        }
      }

      const localStoragePlano = localStorage.getItem('glpy_plano');
      const hasAccess = hasActiveAccess();
      const onboardingDone = localStorage.getItem('glpy_onboarding') !== null;
      const routeDest = !hasAccess ? 'planos' : (onboardingDone ? 'dashboard' : 'onboarding');

      setRows(buildRows(
        authEmail, uid, docExists, docError,
        planoTipo, planoStatus, planoOrigem, dataExpiracao, dataExpiracaoExpired,
        localStoragePlano, hasAccess, routeDest,
        adminGrantFound, adminGrantPlano, adminGrantStatus, adminGrantError,
      ));
      setLoading(false);
    })();
  }, []);

  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 99999,
      background: '#0A1628',
      color: '#E8F0EC',
      fontFamily: 'monospace',
      fontSize: 11,
      maxHeight: open ? '52vh' : 30,
      overflow: 'hidden',
      transition: 'max-height 0.25s ease',
      borderTop: '2px solid #00C27A',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
    }}>
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '5px 12px',
          background: '#00C27A',
          color: '#fff',
          fontFamily: 'monospace',
          fontWeight: 700,
          fontSize: 11,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
        }}
      >
        <span>🔍 GLPY ACCESS DEBUG</span>
        <span>{open ? '▼ fechar' : '▲ abrir'}</span>
      </button>

      {/* Content */}
      <div style={{ overflowY: 'auto', maxHeight: 'calc(52vh - 30px)', padding: '6px 12px 12px' }}>
        {loading ? (
          <div style={{ color: '#7A9AAF', padding: 8, textAlign: 'center' }}>
            Carregando dados do Firebase...
          </div>
        ) : (
          rows.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 8,
                padding: '4px 0',
                borderBottom: '1px solid #1E3348',
              }}
            >
              <span style={{ color: '#7A9AAF', flexShrink: 0, minWidth: 170 }}>{row.label}</span>
              <span style={{
                color: row.ok === true ? '#00C27A' : row.ok === false ? '#E8445A' : '#F5A623',
                textAlign: 'right',
                wordBreak: 'break-all',
                fontWeight: row.ok === false ? 700 : 400,
              }}>
                {row.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
