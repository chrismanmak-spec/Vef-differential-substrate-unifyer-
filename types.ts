
export interface AnomalyResolution {
  observable: string;
  smIssue: string;
  vefResolution: string;
  keyFeature: string;
  status: 'resolved' | 'partial' | 'theoretical';
}

export interface StrategicInsight {
  type: 'prediction' | 'optimization' | 'axiom_extension';
  title: string;
  projection: string;
  confidence: number;
}

export interface VEFAnalysis {
  isComplete: boolean;
  completenessScore: number; 
  resolutionCoverage: number;
  summary: string;
  sections: {
    title: string;
    description: string;
    details: string[];
  }[];
  verdict: string;
  missingElements: string[];
  anomalies: AnomalyResolution[];
  strategicInsights: StrategicInsight[];
}

export interface SyntheticProof {
  element: string;
  mathematicalLogic: string;
  topologicalProof: string;
  conclusion: string;
}
