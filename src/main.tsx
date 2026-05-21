import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);
const path  = window.location.pathname;

if (path === '/admin') {
  // Rota admin completamente isolada — App nunca é montado
  root.render(
    <StrictMode>
      <AdminPanel onNavigate={() => { window.location.href = '/'; }} />
    </StrictMode>,
  );
} else if (path === '/preview') {
  import('./screens/PreviewIndexScreen.tsx').then(({ default: PreviewIndexScreen }) => {
    root.render(
      <StrictMode>
        <PreviewIndexScreen />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocols') {
  import('./components/ProtocolHub.tsx').then(({ default: ProtocolHub }) => {
    const PREVIEW_ROTA_MAP: Record<string, string> = {
      sobrevivendoCanetas:      '/preview/protocolo1',
      efeitosColaterais:        '/preview/protocolo2',
      antiQuedaCabelo:          '/preview/protocolo3',
      antiRebote:               '/preview/protocolo4',
      'anti-rebote':            '/preview/protocolo4',
      psicologiaEmagrecimento:  '/preview/protocolo5',
      alimentacaoBaixoApetite:  '/preview/protocolo6',
      naoPerdaMusculos:         '/preview/protocolo7',
      energiaBaixa:             '/preview/protocolo8',
      ajusteMetabolico:         '/preview/protocolo9',
      transicaoParar:           '/preview/protocolo10',
    };
    root.render(
      <StrictMode>
        <ProtocolHub
          onNavigate={(screen) => {
            const dest = PREVIEW_ROTA_MAP[screen];
            window.location.href = dest ?? '/preview';
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocol-anti-rebote') {
  import('./components/AntiRebote.tsx').then(({ default: AntiRebote }) => {
    root.render(
      <StrictMode>
        <AntiRebote
          onNavigate={(screen) => {
            if (screen === 'protocolHub') {
              window.location.href = '/preview/protocols';
            } else if (screen === 'checkin') {
              window.location.href = '/preview/check-in';
            } else {
              window.location.href = '/preview';
            }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/recipes') {
  import('./components/Recipes.tsx').then(({ default: Recipes }) => {
    root.render(
      <StrictMode>
        <Recipes
          onNavigate={() => {
            window.location.href = '/preview';
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/target-weight') {
  import('./screens/onboarding/TargetWeightScreen.tsx').then(({ default: TargetWeightScreen }) => {
    root.render(
      <StrictMode>
        <TargetWeightScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/weight-pace') {
  import('./screens/onboarding/WeightPaceScreen.tsx').then(({ default: WeightPaceScreen }) => {
    root.render(
      <StrictMode>
        <WeightPaceScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/units') {
  import('./screens/onboarding/UnitsScreen.tsx').then(({ default: UnitsScreen }) => {
    root.render(
      <StrictMode>
        <UnitsScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/current-weight') {
  import('./screens/onboarding/CurrentWeightScreen.tsx').then(({ default: CurrentWeightScreen }) => {
    root.render(
      <StrictMode>
        <CurrentWeightScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/height') {
  import('./screens/onboarding/HeightScreen.tsx').then(({ default: HeightScreen }) => {
    root.render(
      <StrictMode>
        <HeightScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/weight-settings') {
  import('./screens/operational/WeightSettingsScreen.tsx').then(({ default: WeightSettingsScreen }) => {
    root.render(
      <StrictMode>
        <WeightSettingsScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/water') {
  import('./screens/operational/WaterScreen.tsx').then(({ default: WaterScreen }) => {
    root.render(
      <StrictMode>
        <WaterScreen
          onBack={() => { window.location.href = '/preview/home-premium-v2'; }}
          onSave={(amount) => {
            localStorage.setItem('glpy_agua_hoje', String(amount));
            window.location.href = '/preview/home-premium-v2';
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/food-log') {
  import('./screens/operational/FoodLogScreen.tsx').then(({ default: FoodLogScreen }) => {
    root.render(
      <StrictMode>
        <FoodLogScreen
          onBack={() => { window.location.href = '/preview/home-premium-v2'; }}
          onSave={(data) => {
            try {
              const existing = JSON.parse(localStorage.getItem('glpy_refeicoes_hoje') || '[]');
              existing.push({ ...data, savedAt: Date.now() });
              localStorage.setItem('glpy_refeicoes_hoje', JSON.stringify(existing));
            } catch {
              localStorage.setItem('glpy_refeicoes_hoje', JSON.stringify([{ ...data, savedAt: Date.now() }]));
            }
            window.dispatchEvent(new Event('local-storage-change'));
            window.location.href = '/preview/home-premium-v2';
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/injection') {
  import('./screens/operational/InjectionScreen.tsx').then(({ default: InjectionScreen }) => {
    root.render(
      <StrictMode>
        <InjectionScreen
          onBack={() => { window.location.href = '/preview/home-premium-v2'; }}
          onSave={(data) => {
            localStorage.setItem('glpy_injecao_ultima', JSON.stringify({ ...data, savedAt: Date.now() }));
            window.location.href = '/preview/home-premium-v2';
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/treatment-settings') {
  import('./screens/operational/TreatmentSettingsScreen.tsx').then(({ default: TreatmentSettingsScreen }) => {
    root.render(
      <StrictMode>
        <TreatmentSettingsScreen
          onBack={() => { window.location.href = '/preview/home-premium-v2'; }}
          onSave={(data) => {
            localStorage.setItem('glpy_medicamento', data.medication);
            localStorage.setItem('glpy_frequencia',  data.frequency);
            if (data.dose) localStorage.setItem('glpy_dose', data.dose);
            try {
              const onb = JSON.parse(localStorage.getItem('glpy_onboarding') || '{}');
              onb.medicamento = data.medication;
              onb.frequencia  = data.frequency;
              if (data.dose) onb.dose = data.dose;
              localStorage.setItem('glpy_onboarding', JSON.stringify(onb));
            } catch {}
            window.location.href = '/preview/home-premium-v2';
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/side-effects') {
  import('./screens/operational/SideEffectsScreen.tsx').then(({ default: SideEffectsScreen }) => {
    root.render(
      <StrictMode>
        <SideEffectsScreen onBack={() => { window.location.href = '/preview/home-premium-v2'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/emotion') {
  import('./screens/operational/EmotionScreen.tsx').then(({ default: EmotionScreen }) => {
    root.render(
      <StrictMode>
        <EmotionScreen
          onBack={() => { window.location.href = '/preview/home-premium-v2'; }}
          onSave={(data) => {
            localStorage.setItem('glpy_emocao_hoje', JSON.stringify({ ...data, savedAt: Date.now() }));
            window.location.href = '/preview/home-premium-v2';
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/body-measurements') {
  import('./screens/operational/BodyMeasurementsScreen.tsx').then(({ default: BodyMeasurementsScreen }) => {
    root.render(
      <StrictMode>
        <BodyMeasurementsScreen
          onBack={() => { window.location.href = '/preview/home-premium-v2'; }}
          onSave={(data) => {
            localStorage.setItem('glpy_medidas_corporais', JSON.stringify({
              ...data,
              cintura: data.waist,
              busto:   data.chest,
              coxa:    data.thigh,
              savedAt: Date.now(),
            }));
            window.location.href = '/preview/home-premium-v2';
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/photo-timeline') {
  import('./screens/operational/PhotoTimelineScreen.tsx').then(({ default: PhotoTimelineScreen }) => {
    root.render(
      <StrictMode>
        <PhotoTimelineScreen onBack={() => { window.location.href = '/preview/home-premium-v2'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/visual-progress-share') {
  import('./screens/operational/VisualProgressShareScreen.tsx').then(({ default: VisualProgressShareScreen }) => {
    root.render(
      <StrictMode>
        <VisualProgressShareScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/activity') {
  import('./screens/operational/ActivityScreen.tsx').then(({ default: ActivityScreen }) => {
    root.render(
      <StrictMode>
        <ActivityScreen
          onBack={() => { window.location.href = '/preview/home-premium-v2'; }}
          onSave={() => { window.location.href = '/preview/home-premium-v2'; }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/check-in') {
  import('./screens/operational/CheckInScreen.tsx').then(({ default: CheckInScreen }) => {
    root.render(
      <StrictMode>
        <CheckInScreen onBack={() => { window.location.href = '/preview/home-premium-v2'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/weight-history') {
  import('./screens/operational/WeightHistoryScreen.tsx').then(({ default: WeightHistoryScreen }) => {
    root.render(
      <StrictMode>
        <WeightHistoryScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/progress-timeline') {
  import('./screens/operational/ProgressTimelineScreen.tsx').then(({ default: ProgressTimelineScreen }) => {
    root.render(
      <StrictMode>
        <ProgressTimelineScreen onBack={() => { window.location.href = '/preview'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/results') {
  import('./screens/operational/ResultsScreen.tsx').then(({ default: ResultsScreen }) => {
    root.render(
      <StrictMode>
        <ResultsScreen onBack={() => { window.location.href = '/preview/home-premium-v2'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/quick-actions') {
  import('./screens/premium/QuickActionsScreen.tsx').then(({ default: QuickActionsScreen }) => {
    root.render(
      <StrictMode>
        <QuickActionsScreen onBack={() => { window.location.href = '/preview/home-premium-v2'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/supplements') {
  import('./screens/operational/SupplementsScreen.tsx').then(({ default: SupplementsScreen }) => {
    root.render(
      <StrictMode>
        <SupplementsScreen onBack={() => { window.location.href = '/preview/home-premium-v2'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/food-photo') {
  import('./screens/operational/FoodPhotoScreen.tsx').then(({ default: FoodPhotoScreen }) => {
    root.render(
      <StrictMode>
        <FoodPhotoScreen onBack={() => { window.location.href = '/preview/home-premium-v2'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/local-intelligence-test') {
  import('./screens/debug/LocalIntelligenceTestScreen.tsx').then(({ default: LocalIntelligenceTestScreen }) => {
    root.render(
      <StrictMode>
        <LocalIntelligenceTestScreen onBack={() => { window.location.href = '/preview'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/chat-ia') {
  import('./components/ChatIA.tsx').then(({ default: ChatIA }) => {
    root.render(
      <StrictMode>
        <ChatIA onNavigate={() => { window.location.href = '/preview/home-premium-v2'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/home-premium-v2') {
  import('./components/HomePremiumV2.tsx').then(({ default: HomePremiumV2 }) => {
    root.render(
      <StrictMode>
        <HomePremiumV2 />
      </StrictMode>,
    );
  });
} else if (path === '/preview/daily-targets-test') {
  import('./screens/debug/DailyTargetsTestScreen.tsx').then(({ default: DailyTargetsTestScreen }) => {
    root.render(
      <StrictMode>
        <DailyTargetsTestScreen onBack={() => { window.location.href = '/preview'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo1') {
  import('./components/Protocolo1.tsx').then(({ default: Protocolo1 }) => {
    root.render(
      <StrictMode>
        <Protocolo1
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo2') {
  import('./components/Protocolo2.tsx').then(({ default: Protocolo2 }) => {
    root.render(
      <StrictMode>
        <Protocolo2
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo3') {
  import('./components/Protocolo3.tsx').then(({ default: Protocolo3 }) => {
    root.render(
      <StrictMode>
        <Protocolo3
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo4') {
  import('./components/AntiRebote.tsx').then(({ default: AntiRebote }) => {
    root.render(
      <StrictMode>
        <AntiRebote
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo5') {
  import('./components/Protocolo5.tsx').then(({ default: Protocolo5 }) => {
    root.render(
      <StrictMode>
        <Protocolo5
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo6') {
  import('./components/Protocolo6.tsx').then(({ default: Protocolo6 }) => {
    root.render(
      <StrictMode>
        <Protocolo6
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo7') {
  import('./components/Protocolo7.tsx').then(({ default: Protocolo7 }) => {
    root.render(
      <StrictMode>
        <Protocolo7
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo8') {
  import('./components/Protocolo8.tsx').then(({ default: Protocolo8 }) => {
    root.render(
      <StrictMode>
        <Protocolo8
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo9') {
  import('./components/Protocolo9.tsx').then(({ default: Protocolo9 }) => {
    root.render(
      <StrictMode>
        <Protocolo9
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else if (path === '/preview/protocolo10') {
  import('./components/Protocolo10.tsx').then(({ default: Protocolo10 }) => {
    root.render(
      <StrictMode>
        <Protocolo10
          onNavigate={(screen) => {
            if (screen === 'protocolHub') { window.location.href = '/preview/protocols'; }
            else if (screen === 'checkin') { window.location.href = '/preview/check-in'; }
            else { window.location.href = '/preview'; }
          }}
        />
      </StrictMode>,
    );
  });
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

