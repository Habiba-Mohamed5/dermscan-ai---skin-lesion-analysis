
export enum DiagnosisLabel {
  BENIGN = 'Benign',
  MALIGNANT = 'Malignant'
}

export interface AnalysisResult {
  label: DiagnosisLabel;
  confidence: number;
  description: string;
  recommendations: string[];
  abcdeAnalysis: {
    asymmetry: string;
    border: string;
    color: string;
    diameter: string;
    evolving: string;
  };
}

export interface AnalysisHistory {
  id: string;
  date: string;
  imageUrl: string;
  result: AnalysisResult;
}
