
import React, { useState, useEffect, useMemo } from 'react';
import SplashScreen from './components/SplashScreen';
import Layout from './components/Layout';
import { COLORS, DIAS_SEMANA } from './constants';
import { MapPin, Calendar, HelpCircle, Search, X, User, Clock, Info, ChevronDown, Home } from './components/Icons';
import { ViewState, Ensalamento, AcademicEvent, FAQItem } from './types';
import { fetchEnsalamentos, fetchEventos, fetchFAQ } from './services/sheets';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<ViewState>('HOME');
  const [loading, setLoading] = useState(false);
  const [ensalamentos, setEnsalamentos] = useState<Ensalamento[]>([]);
  const [eventos, setEventos] = useState<AcademicEvent[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ensData, evtData, faqData] = await Promise.all([
        fetchEnsalamentos(),
        fetchEventos(),
        fetchFAQ()
      ]);
      setEnsalamentos(ensData);
      setEventos(evtData);
      setFaqs(faqData);
    } catch (err) {
      console.error("Erro ao carregar dados unificados", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const courseList = useMemo(() => {
    const forbidden = ['CURSO', 'NOME DO CURSO', 'A DEFINIR', 'CURSO/TURNO'];
    const uniqueMap = new Map<string, { curso: string, turno: string }>();
    
    ensalamentos.forEach(e => {
      const c = e.curso?.trim();
      const t = e.turno?.trim() || 'A definir';
      if (c && c.length > 2 && !forbidden.includes(c.toUpperCase())) {
        const key = `${c}|${t}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, { curso: c, turno: t });
        }
      }
    });
    
    return Array.from(uniqueMap.values())
      .filter(item => item.curso.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.curso.localeCompare(b.curso));
  }, [ensalamentos, searchTerm]);

  const selectedCourseData = useMemo(() => {
    if (!selectedCourseKey) return [];
    const [name, turno] = selectedCourseKey.split('|');
    return ensalamentos.filter(e => e.curso?.trim() === name && (e.turno?.trim() || 'A definir') === turno);
  }, [selectedCourseKey, ensalamentos]);

  const groupedSchedule = useMemo(() => {
    const groups: Record<string, Ensalamento[]> = {};
    selectedCourseData.forEach(item => {
      const itemDayRaw = item.dia?.trim().toUpperCase() || '';
      const matchedDay = DIAS_SEMANA.find(d => {
        const dUpper = d.toUpperCase();
        return itemDayRaw.includes(dUpper.split('-')[0]) || dUpper.includes(itemDayRaw);
      });
      const dayKey = matchedDay || item.dia || 'Outros';
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(item);
    });
    return groups;
  }, [selectedCourseData]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const navigateTo = (newView: ViewState) => {
    setSearchTerm('');
    setView(newView);
    window.scrollTo(0, 0);
  };

  const selectCourse = (curso: string, turno: string) => {
    setSelectedCourseKey(`${curso}|${turno}`);
    setView('COURSE_DETAIL');
    window.scrollTo(0, 0);
  };

  const isActive = (v: ViewState) => {
    if (v === 'ENSALAMENTOS' && view === 'COURSE_DETAIL') return true;
    return view === v;
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24 max-w-md mx-auto shadow-2xl relative bg-white overflow-x-hidden">
      {/* Content Switcher */}
      <div className="animate-fade-in">
        {view === 'HOME' && (
          <Layout title="Santa Cruz">
            <div className="px-6 pt-10 pb-6 bg-gradient-to-b from-pink-50 to-white">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-pink-100">
                  <span className="text-pink-600 font-black text-xl">SC</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black leading-none">Olá, Estudante!</h2>
                  <p className="text-gray-500 mt-1.5 text-sm">Bem-vindo(a) ao seu Portal Acadêmico.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-pink-100/50 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Status do Sistema</p>
                  <p className="text-sm font-semibold text-gray-800">Tudo pronto por aqui!</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </div>

            <div className="px-6 mt-6 space-y-4 pb-10">
              <button 
                onClick={() => navigateTo('ENSALAMENTOS')}
                className="w-full bg-white p-6 rounded-3xl shadow-sm flex items-center space-x-5 hover:bg-gray-50 transition-all border border-gray-100 text-left"
              >
                <div className="bg-pink-50 p-4 rounded-2xl">
                  <MapPin size={28} color={COLORS.PRIMARY} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Salas</h3>
                  <p className="text-gray-400 text-sm">Ensalamento e horários</p>
                </div>
              </button>

              <button 
                onClick={() => navigateTo('EVENTOS')}
                className="w-full bg-white p-6 rounded-3xl shadow-sm flex items-center space-x-5 hover:bg-gray-50 transition-all border border-gray-100 text-left"
              >
                <div className="bg-pink-50 p-4 rounded-2xl">
                  <Calendar size={28} color={COLORS.PRIMARY} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Eventos</h3>
                  <p className="text-gray-400 text-sm">Programação da Santa Cruz</p>
                </div>
              </button>

              <button 
                onClick={() => navigateTo('FAQ')}
                className="w-full bg-white p-6 rounded-3xl shadow-sm flex items-center space-x-5 hover:bg-gray-50 transition-all border border-gray-100 text-left"
              >
                <div className="bg-pink-50 p-4 rounded-2xl">
                  <HelpCircle size={28} color={COLORS.PRIMARY} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Dúvidas</h3>
                  <p className="text-gray-400 text-sm">Central de Ajuda (FAQ)</p>
                </div>
              </button>
            </div>
          </Layout>
        )}

        {view === 'ENSALAMENTOS' && (
          <Layout title="Ensalamentos">
            <div className="px-6 pt-6">
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} color={COLORS.PRIMARY} />
                </div>
                <input 
                  type="text" 
                  placeholder="Pesquisar seu curso..."
                  className="w-full bg-white border border-gray-200 py-4 pl-12 pr-12 rounded-2xl text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <X size={20} className="text-gray-400" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
                   <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                   <p className="animate-pulse">Carregando salas...</p>
                </div>
              ) : (
                <div className="space-y-3 pb-20">
                  {courseList.length > 0 ? (
                    courseList.map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => selectCourse(item.curso, item.turno)}
                        className="w-full bg-white p-5 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm active:scale-[0.98] transition-all text-left"
                      >
                        <div className="flex flex-col pr-4">
                          <span className="font-bold text-gray-900 line-clamp-1">{item.curso}</span>
                          <span className="text-xs text-pink-600 font-medium mt-0.5 uppercase tracking-wider">{item.turno}</span>
                        </div>
                        <div className="bg-pink-50 p-2 rounded-lg">
                          <ChevronDown size={18} className="text-pink-400 -rotate-90" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                      <div className="bg-gray-50 p-6 rounded-full mb-4">
                        <Search size={32} className="opacity-20" />
                      </div>
                      <p className="font-medium">Nenhum curso encontrado.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Layout>
        )}

        {view === 'COURSE_DETAIL' && (
          <Layout title="Detalhes do Horário">
            <div className="px-6 pt-6">
              <button onClick={() => setView('ENSALAMENTOS')} className="mb-6 flex items-center text-pink-600 font-bold text-sm space-x-1">
                <ChevronDown size={18} className="rotate-90" />
                <span>Voltar para a lista</span>
              </button>

              <div className="bg-pink-600 p-6 rounded-3xl mb-8 border border-pink-700 shadow-lg text-white">
                <h2 className="text-xl font-bold leading-tight mb-3">
                  {selectedCourseKey?.split('|')[0]}
                </h2>
                <div className="flex items-center space-x-1.5 bg-white/20 px-3 py-1.5 rounded-full text-white font-semibold text-xs border border-white/10 w-fit">
                  <Clock size={12} />
                  <span>Turno: {selectedCourseKey?.split('|')[1]}</span>
                </div>
              </div>

              {Object.keys(groupedSchedule).length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                   <p>Nenhum horário disponível para este curso.</p>
                </div>
              ) : (
                <div className="space-y-10 pb-20">
                  {DIAS_SEMANA.map(dia => {
                    const scheduleForDay = groupedSchedule[dia];
                    if (!scheduleForDay) return null;
                    return (
                      <div key={dia} className="space-y-4">
                        <div className="flex items-center space-x-3 sticky top-20 bg-white/90 backdrop-blur-sm py-2 z-10 border-b border-gray-100">
                          <div className="w-1.5 h-6 rounded-full bg-pink-500"></div>
                          <h3 className="text-lg font-bold text-gray-900">{dia}</h3>
                        </div>
                        <div className="space-y-3">
                          {scheduleForDay.map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-pink-200 transition-colors">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-gray-900 flex-1 pr-4 leading-tight">{item.disciplina}</h4>
                                <div className="bg-pink-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-sm">
                                  Sala {item.sala}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <User size={14} className="text-pink-300" />
                                  <span className="text-xs"><span className="font-bold opacity-80">Prof(a):</span> {item.professor || 'A Definir'}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <Clock size={14} className="text-pink-300" />
                                  <span className="text-xs"><span className="font-bold opacity-80">Horário:</span> {item.horario}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Layout>
        )}

        {view === 'EVENTOS' && (
          <Layout title="Eventos">
            <div className="px-6 pt-6 space-y-6 pb-20">
              {loading ? (
                <div className="flex flex-col items-center py-20 text-gray-400">
                  <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Carregando eventos...</p>
                </div>
              ) : eventos.length > 0 ? (
                eventos.map(event => (
                  <div key={event.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:border-pink-200 transition-colors">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{event.titulo}</h3>
                      <p className="text-sm leading-relaxed mb-6 font-medium" style={{ color: COLORS.PRIMARY }}>{event.descricao}</p>
                      <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-gray-50">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Calendar size={14} />
                          <span className="text-xs font-semibold">{event.data}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock size={14} className="text-pink-400" />
                          <span className="text-xs font-medium">{event.horario}</span>
                        </div>
                        {event.local && (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <MapPin size={14} className="text-pink-400" />
                            <span className="text-xs font-medium">{event.local}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} className="opacity-20" />
                  </div>
                  <p>Nenhum evento programado.</p>
                </div>
              )}
            </div>
          </Layout>
        )}

        {view === 'FAQ' && (
          <Layout title="Dúvidas Frequentes">
            <div className="px-6 pt-6 space-y-4 pb-20">
              {loading ? (
                <div className="flex flex-col items-center py-20 text-gray-400">
                  <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Carregando perguntas...</p>
                </div>
              ) : faqs.length > 0 ? (
                faqs.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button onClick={() => setActiveFaq(activeFaq === item.id ? null : item.id)} className="w-full p-5 flex items-center justify-between text-left">
                      <div className="flex flex-col pr-4">
                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">{item.categoria}</span>
                        <span className="font-semibold text-gray-800 leading-snug">{item.pergunta}</span>
                      </div>
                      <div className={`p-1 rounded-full transition-colors ${activeFaq === item.id ? 'bg-pink-50' : ''}`}>
                        <ChevronDown size={20} className={`text-pink-300 transition-transform duration-300 ${activeFaq === item.id ? 'rotate-180 text-pink-600' : '0'}`} />
                      </div>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out ${activeFaq === item.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <div className="px-5 pb-6 pt-2 text-gray-500 text-sm leading-relaxed border-t border-gray-50 whitespace-pre-wrap">{item.resposta}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-400"><p>Central de dúvidas indisponível.</p></div>
              )}
            </div>
          </Layout>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center h-20 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50 rounded-t-[32px]">
        <button 
          onClick={() => navigateTo('HOME')}
          className={`flex flex-col items-center justify-center space-y-1 w-1/4 transition-all ${isActive('HOME') ? 'text-pink-600 scale-110' : 'text-gray-400'}`}
        >
          <Home size={22} weight={isActive('HOME') ? 'bold' : 'regular'} />
          <span className="text-[10px] font-bold">Home</span>
          {isActive('HOME') && <div className="w-1 h-1 bg-pink-600 rounded-full"></div>}
        </button>

        <button 
          onClick={() => navigateTo('ENSALAMENTOS')}
          className={`flex flex-col items-center justify-center space-y-1 w-1/4 transition-all ${isActive('ENSALAMENTOS') ? 'text-pink-600 scale-110' : 'text-gray-400'}`}
        >
          <MapPin size={22} />
          <span className="text-[10px] font-bold">Sala</span>
          {isActive('ENSALAMENTOS') && <div className="w-1 h-1 bg-pink-600 rounded-full"></div>}
        </button>

        <button 
          onClick={() => navigateTo('EVENTOS')}
          className={`flex flex-col items-center justify-center space-y-1 w-1/4 transition-all ${isActive('EVENTOS') ? 'text-pink-600 scale-110' : 'text-gray-400'}`}
        >
          <Calendar size={22} />
          <span className="text-[10px] font-bold">Eventos</span>
          {isActive('EVENTOS') && <div className="w-1 h-1 bg-pink-600 rounded-full"></div>}
        </button>

        <button 
          onClick={() => navigateTo('FAQ')}
          className={`flex flex-col items-center justify-center space-y-1 w-1/4 transition-all ${isActive('FAQ') ? 'text-pink-600 scale-110' : 'text-gray-400'}`}
        >
          <HelpCircle size={22} />
          <span className="text-[10px] font-bold">FAQ</span>
          {isActive('FAQ') && <div className="w-1 h-1 bg-pink-600 rounded-full"></div>}
        </button>
      </nav>
    </div>
  );
};

export default App;
