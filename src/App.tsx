/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from './firebase.js';
import { syncFromFirestore } from './services/firestore';
import { getLocalDateKey } from './utils/formatters';
import { hasActiveAccess } from './core/accessControl';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import HomePremiumV2 from './components/HomePremiumV2';
import ProtocolHub from './components/ProtocolHub';
import ProtocolDay from './components/ProtocolDay';
import ChatIA from './components/ChatIA';
import Recipes from './components/Recipes';
import CheckIn from './components/CheckIn';
import Progress from './components/Progress';
import Profile from './components/Profile';
import FotoPrato from './components/FotoPrato';
import Injecao from './components/Injecao';
import ContadorReceita from './components/ContadorReceita';
import AlertaInjecao from './components/AlertaInjecao';
import AntiRebote from './components/AntiRebote';
import PlanoSemanal from './components/PlanoSemanal';
import FotosEvolucao from './components/FotosEvolucao';
import Loja from './components/Loja';
import Perfil from './components/Perfil';
import Planos from './components/Planos';
import Comunidade from './components/Comunidade';
import EmBreve from './components/EmBreve';
import Protocolo1 from './components/Protocolo1';
import Protocolo2 from './components/Protocolo2';
import Protocolo3 from './components/Protocolo3';
import Protocolo5 from './components/Protocolo5';
import Protocolo6 from './components/Protocolo6';
import Protocolo7 from './components/Protocolo7';
import Protocolo8 from './components/Protocolo8';
import Protocolo9 from './components/Protocolo9';
import Protocolo10 from './components/Protocolo10';
import LocalIntelligenceTestScreen from './screens/debug/LocalIntelligenceTestScreen';
import DailyTargetsTestScreen from './screens/debug/DailyTargetsTestScreen';
import DateRiskTestScreen from './screens/debug/DateRiskTestScreen';
import QuickActionsScreen from './screens/premium/QuickActionsScreen';
import HubScreen from './screens/premium/HubScreen';
import BodyProfileScreen from './screens/operational/BodyProfileScreen';
import WaterScreen from './screens/operational/WaterScreen';
import ResultsScreen from './screens/operational/ResultsScreen';
import CheckInScreen from './screens/operational/CheckInScreen';
import FoodLogScreen from './screens/operational/FoodLogScreen';
import EmotionScreen from './screens/operational/EmotionScreen';
import BodyMeasurementsScreen from './screens/operational/BodyMeasurementsScreen';
import InjectionScreen from './screens/operational/InjectionScreen';
import PhotoTimelineScreen from './screens/operational/PhotoTimelineScreen';
import FoodPhotoAnalysisScreen from './screens/operational/FoodPhotoAnalysisScreen';
import { resolveSafeReturn } from './utils/navigationReturn';
import { glpyStore } from './data/glpyStore';
import { glpyBlackBox } from './data/glpyBlackBox';
import { CATEGORIES, DOMAINS, SIGNALS, EVENT_TYPES, MOOD_TO_SIGNAL } from './data/glpyEventCatalog';

const onboardingDone = localStorage.getItem("glpy_onboarding") !== null;

// Detecta rota /acesso na carga do módulo para inicializar o estado correto
const _acessoParams = (() => {
  if (window.location.pathname !== '/acesso') return null;
  const p = new URLSearchParams(window.location.search);
  const email = p.get('email');
  const token = p.get('token');
  return email && token ? { email, token } : null;
})();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // true enquanto o auto-login via /acesso está em andamento
  const [autoLoginLoading, setAutoLoginLoading] = useState(!!_acessoParams);

  useEffect(() => {
    if (localStorage.getItem("glpy_tema") === "dark") {
      document.documentElement.classList.add("dark");
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        localStorage.setItem("glpy_user", JSON.stringify({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
        }));
        try {
          const { primeiroAcesso } = await syncFromFirestore();
          console.log('primeiroAcesso:', primeiroAcesso);
          if (primeiroAcesso) {
            setTelaAtual('onboarding');
          } else {
            // Bloqueia acesso sem plano ativo (verificado via Firestore → accessControl)
            if (!hasActiveAccess() && onboardingDone) {
              setTelaAtual('planos');
            }
          }
        } catch {
          if (!hasActiveAccess() && onboardingDone) {
            setTelaAtual('planos');
          }
        }
      } else {
        localStorage.removeItem("glpy_user");
      }
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Auto-login via /acesso?email=...&token=...
  useEffect(() => {
    if (!_acessoParams) return;
    const { email, token } = _acessoParams;
    const senha = token === 'GLPY2026' ? 'GLPY@2026' : token;
    signInWithEmailAndPassword(auth, email, senha)
      .then(() => {
        window.history.replaceState({}, '', '/');
      })
      .catch((err) => {
        console.error('Auto-login falhou:', err);
        window.history.replaceState({}, '', '/');
      })
      .finally(() => {
        setAutoLoginLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [telaAtual, setTelaAtual] = useState(
    onboardingDone ? 'dashboard' : 'splash'
  );

  const renderScreen = () => {
    switch (telaAtual) {
      case 'splash':
        return (
          <SplashScreen
            onNext={() => setTelaAtual(onboardingDone ? 'dashboard' : 'onboarding')}
            onDashboard={() => setTelaAtual('dashboard')}
          />
        );
      case 'onboarding':   return <Onboarding onNext={() => { const plano = localStorage.getItem('glpy_plano'); setTelaAtual(plano ? 'dashboard' : 'planos'); }} />;
      case 'dashboard':    return <HomePremiumV2 onNavigate={setTelaAtual} />;
      case 'quickActions':
        return (
          <QuickActionsScreen
            onBack={() => setTelaAtual('dashboard')}
            onNavigate={setTelaAtual}
          />
        );
      case 'hub':          return <HubScreen onNavigate={setTelaAtual} />;
      case 'protocolHub':  return <ProtocolHub onNavigate={setTelaAtual} />;
      case 'protocolDay':  return <ProtocolDay onNavigate={setTelaAtual} />;
      case 'chatIA':       return <ChatIA onNavigate={setTelaAtual} />;
      case 'recipes':
      case 'receitas':     return <Recipes onNavigate={setTelaAtual} />;
      case 'checkin':      return <CheckInScreen onBack={() => setTelaAtual('dashboard')} />;
      case 'progress':     return <ResultsScreen onBack={() => setTelaAtual('dashboard')} onNavigate={setTelaAtual} />;
      case 'perfil':       return <Perfil onNavigate={setTelaAtual} />;
      case 'profile':      return <Profile onNavigate={setTelaAtual} />;
      case 'fotoPrato':    return <FotoPrato onNavigate={setTelaAtual} />;
      case 'planoSemanal': return <PlanoSemanal onNavigate={setTelaAtual} />;
      case 'injecao':      return <Injecao onNavigate={setTelaAtual} />;
      case 'contadorReceita': return <ContadorReceita onNavigate={setTelaAtual} />;
      case 'alertaInjecao': return <AlertaInjecao onNavigate={setTelaAtual} />;
      case 'antiRebote':   return <AntiRebote onNavigate={setTelaAtual} />;
      case 'fotosEvolucao': return <FotosEvolucao onNavigate={setTelaAtual} />;
      case 'loja':         return <Loja onNavigate={setTelaAtual} />;
      case 'planos':       return <Planos onNavigate={setTelaAtual} />;
      case 'comunidade':            return <Comunidade onNavigate={setTelaAtual} />;
      case 'emBreve':               return <EmBreve onNavigate={setTelaAtual} />;
      case 'sobrevivendoCanetas':   return <Protocolo1 onNavigate={setTelaAtual} />;
      case 'efeitosColaterais':     return <Protocolo2 onNavigate={setTelaAtual} />;
      case 'antiQuedaCabelo':       return <Protocolo3 onNavigate={setTelaAtual} />;
      case 'psicologiaEmagrecimento': return <Protocolo5 onNavigate={setTelaAtual} />;
      case 'alimentacaoBaixoApetite': return <Protocolo6 onNavigate={setTelaAtual} />;
      case 'naoPerdaMusculos':      return <Protocolo7 onNavigate={setTelaAtual} />;
      case 'energiaBaixa':          return <Protocolo8 onNavigate={setTelaAtual} />;
      case 'ajusteMetabolico':      return <Protocolo9 onNavigate={setTelaAtual} />;
      case 'transicaoParar':        return <Protocolo10 onNavigate={setTelaAtual} />;
      case 'localIntelligenceTest': return <LocalIntelligenceTestScreen onBack={() => setTelaAtual('dashboard')} />;
      case 'dailyTargetsTest': return <DailyTargetsTestScreen onBack={() => setTelaAtual('dashboard')} />;
      case 'dateRiskTest': return <DateRiskTestScreen onBack={() => setTelaAtual('dashboard')} />;
      case 'bodyProfile':  return <BodyProfileScreen onBack={() => setTelaAtual(resolveSafeReturn('dashboard'))} />;
      case 'refeicao':     return <FoodLogScreen
        onBack={() => setTelaAtual(resolveSafeReturn('dashboard'))}
        onNavigateToPhoto={() => setTelaAtual('fotoAnalise')}
        onSave={() => setTelaAtual(resolveSafeReturn('dashboard'))}
      />;
      case 'agua':         return <WaterScreen
        onBack={() => setTelaAtual(resolveSafeReturn('dashboard'))}
        onSave={(amount) => {
          const today = getLocalDateKey();
          glpyStore.water.saveToday({ amount, date: today, updatedAt: new Date().toISOString() });
          window.dispatchEvent(new Event('local-storage-change'));
          setTelaAtual(resolveSafeReturn('dashboard'));
        }}
      />;
      case 'emocao':       return <EmotionScreen
        onBack={() => setTelaAtual(resolveSafeReturn('dashboard'))}
        onSave={(data) => {
          glpyStore.emotion.saveToday({ ...data, savedAt: Date.now() });
          glpyBlackBox.addEvent({
            type: EVENT_TYPES.EMOTION_LOGGED, category: CATEGORIES.EMOTION, domain: DOMAINS.PSYCHOLOGY,
            signal: MOOD_TO_SIGNAL[data.mood as string] ?? SIGNALS.EMOTION_LOGGED,
            screen: 'EmotionScreen', source: 'manual',
            payload: { mood: data.mood, energy: data.energy },
          });
          window.dispatchEvent(new Event('local-storage-change'));
          setTelaAtual(resolveSafeReturn('dashboard'));
        }}
      />;
      case 'medida':       return <BodyMeasurementsScreen
        onBack={() => setTelaAtual(resolveSafeReturn('dashboard'))}
        onSave={(data) => {
          const toNum = (s: string) => { const n = parseFloat(s.replace(',', '.')); return (isNaN(n) || n <= 0) ? undefined : n; };
          const medidas = { waist: toNum(data.waist), hip: toNum(data.hip), abdomen: toNum(data.abdomen), chest: toNum(data.chest), arm: toNum(data.arm), thigh: toNum(data.thigh), calf: toNum(data.calf), cintura: toNum(data.waist), quadril: toNum(data.hip), busto: toNum(data.chest), braco: toNum(data.arm), coxa: toNum(data.thigh), panturrilha: toNum(data.calf), savedAt: Date.now() };
          localStorage.setItem('glpy_medidas_corporais', JSON.stringify(medidas));
          const isFirstBaseline = glpyStore.progress.ensureInitialMeasurements(medidas);
          const initial = glpyStore.progress.getInitialMeasurements() ?? {};
          const fields = ['cintura', 'quadril', 'coxa', 'busto', 'panturrilha'] as const;
          const totalDiff = fields.reduce((sum, k) => {
            const cur = parseFloat(String(medidas[k] ?? '')), ini = parseFloat(String(initial[k] ?? ''));
            return (!isNaN(cur) && !isNaN(ini) && ini > 0) ? sum + (ini - cur) : sum;
          }, 0);
          glpyBlackBox.addEvent({
            type: EVENT_TYPES.MEASUREMENTS_UPDATED, category: CATEGORIES.PROGRESS, domain: DOMAINS.PROGRESS,
            signal: SIGNALS.MEASUREMENTS_UPDATED, screen: 'BodyMeasurementsScreen', source: 'manual',
            payload: { fieldsChanged: fields.filter(k => !!medidas[k]), hasInitialBaseline: !isFirstBaseline, totalCmDifference: parseFloat(totalDiff.toFixed(2)) },
          });
          window.dispatchEvent(new Event('local-storage-change'));
          setTelaAtual(resolveSafeReturn('dashboard'));
        }}
      />;
      case 'aplicacao':    return <InjectionScreen
        onBack={() => setTelaAtual(resolveSafeReturn('dashboard'))}
        onSave={(data) => {
          glpyStore.treatment.saveUltimaInjecao({ ...data, savedAt: Date.now() });
          window.dispatchEvent(new Event('local-storage-change'));
          setTelaAtual(resolveSafeReturn('dashboard'));
        }}
      />;
      case 'foto':         return <PhotoTimelineScreen onBack={() => setTelaAtual(resolveSafeReturn('dashboard'))} />;
      // BUG 15B — tela de análise de foto do prato (mock — BUG 15C integra FatSecret real)
      case 'fotoAnalise': return (
        <FoodPhotoAnalysisScreen
          onBack={() => setTelaAtual(resolveSafeReturn('dashboard'))}
          onNavigate={setTelaAtual}
          onSave={(_data) => {
            // TODO BUG 15C: persistir _data em glpy_refeicoes_hoje e disparar local-storage-change
            setTelaAtual(resolveSafeReturn('dashboard'));
          }}
        />
      );
      default:                      return <HomePremiumV2 onNavigate={setTelaAtual} />;
    }
  };

  if (autoLoginLoading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center gap-5">
        <span className="text-5xl">🌿</span>
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white/70 text-sm font-medium">Preparando seu acesso...</p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{renderScreen()}</>;
}
