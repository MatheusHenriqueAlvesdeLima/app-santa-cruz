import { Ensalamento, AcademicEvent, FAQItem } from '../types';
import { GOOGLE_SHEET_ENSALAMENTOS_URL, GOOGLE_SHEET_EVENTOS_URL, GOOGLE_SHEET_FAQ_URL } from '../constants';

/**
 * Processa uma linha de CSV respeitando aspas e detectando o delimitador.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let curVal = '';
  let inQuotes = false;
  
  // Detecta o delimitador: vírgula ou ponto-e-vírgula (comum em Excel/Sheets em PT-BR)
  const delimiter = line.includes(';') && (line.split(';').length > line.split(',').length) ? ';' : ',';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(curVal.trim().replace(/^"|"$/g, ''));
      curVal = '';
    } else {
      curVal += char;
    }
  }
  result.push(curVal.trim().replace(/^"|"$/g, ''));
  return result;
}

async function fetchCSV(url: string) {
  // Adiciona timestamp para evitar cache do navegador e garantir dados novos
  const cacheBuster = `&t=${Date.now()}`;
  const response = await fetch(url + cacheBuster);
  if (!response.ok) throw new Error(`Erro ao baixar CSV: ${response.status}`);
  const text = await response.text();
  return text.split(/\r?\n/).filter(line => line.trim().length > 0);
}

export async function fetchEnsalamentos(): Promise<Ensalamento[]> {
  try {
    const lines = await fetchCSV(GOOGLE_SHEET_ENSALAMENTOS_URL);
    const results: Ensalamento[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length >= 7) {
        results.push({
          semestre: cols[0] || 'A definir',
          curso: cols[1] || 'A definir',
          disciplina: cols[2] || 'A definir',
          professor: cols[3] || 'A definir',
          dia: cols[4] || 'A definir',
          horario: cols[5] || 'A definir',
          sala: cols[6] || 'A definir',
          turno: cols[7] || 'A definir',
        });
      }
    }
    return results;
  } catch (error) {
    console.error('Erro Ensalamentos:', error);
    return [];
  }
}

export async function fetchEventos(): Promise<AcademicEvent[]> {
  try {
    const lines = await fetchCSV(GOOGLE_SHEET_EVENTOS_URL);
    const results: AcademicEvent[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      // Ordem esperada: Titulo, Data, Horário, Descrição, Local
      if (cols.length >= 2) {
        results.push({
          id: `event-${i}`,
          titulo: cols[0] || 'Evento Sem Título',
          data: cols[1] || 'A definir',
          horario: cols[2] || 'A definir',
          descricao: cols[3] || '',
          local: cols[4] || ''
        });
      }
    }
    return results;
  } catch (error) {
    console.error('Erro Eventos:', error);
    return [];
  }
}

export async function fetchFAQ(): Promise<FAQItem[]> {
  try {
    const lines = await fetchCSV(GOOGLE_SHEET_FAQ_URL);
    const results: FAQItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      // Ordem mais natural: Pergunta, Resposta, Categoria (opcional)
      // Se tiver pelo menos Pergunta e Resposta (2 colunas)
      if (cols.length >= 2) {
        results.push({
          id: `faq-${i}`,
          pergunta: cols[0] || '',
          resposta: cols[1] || '',
          categoria: cols[2] || 'Geral'
        });
      }
    }
    return results;
  } catch (error) {
    console.error('Erro FAQ:', error);
    return [];
  }
}