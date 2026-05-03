/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
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

// Verifica se onboarding já foi concluído
const onboardingDone = localStorage.getItem("glpy_onboarding") !== null;

export default function App() {
  // Se onboarding já feito, começa no dashboard direto
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
      case 'onboarding':   return <Onboarding onNext={() => setTelaAtual('dashboard')} />;
      case 'dashboard':    return <Dashboard onNavigate={setTelaAtual} />;
      case 'protocolHub':  return <ProtocolHub onNavigate={setTelaAtual} />;
      case 'protocolDay':  return <ProtocolDay onNavigate={setTelaAtual} />;
      case 'chatIA':       return <ChatIA onNavigate={setTelaAtual} />;
      case 'recipes':
      case 'receitas':     return <Recipes onNavigate={setTelaAtual} />;
      case 'checkin':      return <CheckIn onNavigate={setTelaAtual} />;
      case 'progress':     return <Progress onNavigate={setTelaAtual} />;
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
      default:             return <Dashboard onNavigate={setTelaAtual} />;
    }
  };

  return <>{renderScreen()}</>;
}
