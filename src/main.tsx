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
        <WaterScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/food-log') {
  import('./screens/operational/FoodLogScreen.tsx').then(({ default: FoodLogScreen }) => {
    root.render(
      <StrictMode>
        <FoodLogScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/injection') {
  import('./screens/operational/InjectionScreen.tsx').then(({ default: InjectionScreen }) => {
    root.render(
      <StrictMode>
        <InjectionScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/treatment-settings') {
  import('./screens/operational/TreatmentSettingsScreen.tsx').then(({ default: TreatmentSettingsScreen }) => {
    root.render(
      <StrictMode>
        <TreatmentSettingsScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/side-effects') {
  import('./screens/operational/SideEffectsScreen.tsx').then(({ default: SideEffectsScreen }) => {
    root.render(
      <StrictMode>
        <SideEffectsScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/emotion') {
  import('./screens/operational/EmotionScreen.tsx').then(({ default: EmotionScreen }) => {
    root.render(
      <StrictMode>
        <EmotionScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/body-measurements') {
  import('./screens/operational/BodyMeasurementsScreen.tsx').then(({ default: BodyMeasurementsScreen }) => {
    root.render(
      <StrictMode>
        <BodyMeasurementsScreen onBack={() => { window.location.href = '/'; }} />
      </StrictMode>,
    );
  });
} else if (path === '/preview/photo-timeline') {
  import('./screens/operational/PhotoTimelineScreen.tsx').then(({ default: PhotoTimelineScreen }) => {
    root.render(
      <StrictMode>
        <PhotoTimelineScreen onBack={() => { window.location.href = '/'; }} />
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
        <ActivityScreen onBack={() => { window.location.href = '/'; }} />
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
