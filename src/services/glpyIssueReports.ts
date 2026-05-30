// GLPY — Issue Reports Service
// Registra localmente erros apontados pelo usuário para melhoria futura.
// Dados ficam em localStorage (glpy_issue_reports) para futura migração ao Firebase.

const STORAGE_KEY = 'glpy_issue_reports';
const APP_VERSION = '17B.31';

// ── Tipos ────────────────────────────────────────────────────────────────────

export type IssueArea =
  | 'nutrition'
  | 'protocol'
  | 'recipe'
  | 'checklist'
  | 'emotion'
  | 'activity'
  | 'measurements'
  | 'navigation'
  | 'paywall'
  | 'ai_response'
  | 'other';

export type IssueType =
  | 'data_dispute'
  | 'analysis_error'
  | 'navigation_bug'
  | 'ai_wrong_response'
  | 'other';

export type IssueSource = 'chat_ia' | 'food_photo' | 'manual';
export type IssueSeverity = 'low' | 'medium' | 'high';
export type IssueStatus = 'pending_review' | 'reviewed' | 'resolved';

export interface GlpyIssueReport {
  id:               string;
  type:             IssueType;
  area:             IssueArea;
  source:           IssueSource;
  severity:         IssueSeverity;
  userMessage:      string;
  aiResponse:       string;
  relatedMealId?:   string;
  relatedMealName?: string;
  createdAt:        string;
  /** @deprecated use createdAt */
  detectedAt:       string;
  status:           IssueStatus;
  appVersion?:      string;
}

// ── Detecção genérica de erro relatado pelo usuário ──────────────────────────

const ERROR_KEYWORDS = [
  // Erros genéricos
  'app errou', 'errou', 'está errado', 'tá errado', 'não está certo',
  'não confere', 'não bate', 'não foi isso', 'incorreto', 'incorreta',
  'diferente do que', 'não corresponde',
  // Nutrição / análise de foto
  'caloria errada', 'calorias erradas', 'a análise não bate', 'análise errada',
  'errou a análise', 'foto errada', 'valor errado', 'macro errado',
  'refeição errada', 'esse registro está errado', 'registro errado',
  // Correção
  'corrigir', 'preciso corrigir', 'quero corrigir', 'como corrijo',
  // Protocolo
  'protocolo errado', 'missão errada', 'dia errado', 'protocolo não', 'missão não',
  // Receitas
  'receita errada', 'ingrediente errado',
  // Checklist
  'checklist errado', 'lista errada', 'não marquei', 'marcou errado',
  // Emoções / humor
  'emoção errada', 'humor errado', 'registrei errado',
  // Atividade
  'atividade errada', 'treino errado', 'passos errados', 'exercício errado',
  // Medidas / peso
  'peso errado', 'medida errada', 'circunferência errada', 'altura errada',
  // Navegação
  'não abre', 'botão não funciona', 'tela errada', 'não navega',
  // Paywall / plano
  'plano errado', 'cobrou errado', 'não desbloqueou',
  // Resposta da IA
  'você errou', 'ia errou', 'resposta errada', 'informação errada',
  'disse errado', 'glpy disse algo errado',
];

export function detectsAppError(userMessage: string): boolean {
  const lower = userMessage.toLowerCase();
  return ERROR_KEYWORDS.some(kw => lower.includes(kw));
}

/** Mantido para compatibilidade com código legado */
export const detectsAnalysisError = detectsAppError;

// ── Classificação de área ────────────────────────────────────────────────────

const AREA_SIGNALS: Array<{ area: IssueArea; keywords: string[] }> = [
  { area: 'nutrition',     keywords: ['caloria', 'macro', 'prato', 'foto', 'refeição', 'alimento', 'café', 'almoço', 'jantar', 'lanche', 'proteína', 'carboidrato', 'gordura', 'análise'] },
  { area: 'protocol',      keywords: ['protocolo', 'missão', 'tarefa', 'dia do protocolo'] },
  { area: 'recipe',        keywords: ['receita', 'ingrediente'] },
  { area: 'checklist',     keywords: ['checklist', 'lista', 'check'] },
  { area: 'emotion',       keywords: ['emoção', 'humor', 'sentimento'] },
  { area: 'activity',      keywords: ['atividade', 'exercício', 'treino', 'passos'] },
  { area: 'measurements',  keywords: ['peso', 'medida', 'cintura', 'altura', 'circunferência'] },
  { area: 'navigation',    keywords: ['tela', 'botão', 'menu', 'navegar', 'abre', 'funciona'] },
  { area: 'paywall',       keywords: ['plano', 'pagamento', 'assinatura', 'premium', 'upgrade', 'cobrou'] },
  { area: 'ai_response',   keywords: ['você disse', 'ia disse', 'glpy disse', 'resposta da ia', 'você errou', 'ia errou'] },
];

export function classifyErrorArea(userMessage: string): IssueArea {
  const lower = userMessage.toLowerCase();
  for (const { area, keywords } of AREA_SIGNALS) {
    if (keywords.some(kw => lower.includes(kw))) return area;
  }
  return 'other';
}

// ── Persistência ──────────────────────────────────────────────────────────────

export interface SaveIssueReportOptions {
  userMessage:      string;
  aiResponse:       string;
  source?:          IssueSource;
  area?:            IssueArea;
  type?:            IssueType;
  severity?:        IssueSeverity;
  relatedMealId?:   string;
  relatedMealName?: string;
}

export function saveIssueReport(
  userMessageOrOptions: string | SaveIssueReportOptions,
  aiResponse  = '',
  source:   IssueSource   = 'chat_ia',
  relatedMealId?: string,
  relatedMealName?: string,
): void {
  try {
    // Aceita chamada legada (posicionais) ou novo objeto de opções
    let opts: SaveIssueReportOptions;
    if (typeof userMessageOrOptions === 'string') {
      opts = { userMessage: userMessageOrOptions, aiResponse, source, relatedMealId, relatedMealName };
    } else {
      opts = userMessageOrOptions;
    }

    const area     = opts.area     ?? classifyErrorArea(opts.userMessage);
    const severity = opts.severity ?? 'medium';
    const type     = opts.type     ?? (area === 'nutrition' ? 'analysis_error' : area === 'ai_response' ? 'ai_wrong_response' : area === 'navigation' ? 'navigation_bug' : 'data_dispute');

    const existing: GlpyIssueReport[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    );
    const now = new Date().toISOString();
    const report: GlpyIssueReport = {
      id:             Date.now().toString(),
      type,
      area,
      source:         opts.source ?? 'chat_ia',
      severity,
      userMessage:    opts.userMessage,
      aiResponse:     opts.aiResponse,
      relatedMealId:  opts.relatedMealId,
      relatedMealName: opts.relatedMealName,
      createdAt:      now,
      detectedAt:     now,
      status:         'pending_review',
      appVersion:     APP_VERSION,
    };
    existing.push(report);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    console.log('[GLPY] issue report saved:', report.id, '| area:', area, '| type:', type);
  } catch {
    // não bloqueia o fluxo principal
  }
}

export function getIssueReports(): GlpyIssueReport[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
