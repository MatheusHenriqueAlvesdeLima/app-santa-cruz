
export interface Ensalamento {
  semestre: string;
  curso: string;
  disciplina: string;
  professor: string;
  dia: string;
  horario: string;
  sala: string;
  turno: string;
}

export interface AcademicEvent {
  id: string;
  titulo: string;
  data: string;
  horario: string;
  descricao: string;
  local?: string;
}

export interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
}

export type ViewState = 'HOME' | 'ENSALAMENTOS' | 'COURSE_DETAIL' | 'EVENTOS' | 'FAQ';
