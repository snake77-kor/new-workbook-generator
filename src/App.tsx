import React, { useState, useRef } from 'react';

// -----------------------------------------------------------------------------
// 1. 스타일 정의 (A4 최적화 및 인쇄 설정)
// -----------------------------------------------------------------------------
const STYLES = `
@page { size: A4; margin: 10mm; } /* 여백을 줄여 내용 확보 */
@media print { 
  .no-print { display: none !important; } 
  .page-break { page-break-after: always; } /* 파트별 강제 페이지 넘김 */
  .exam-wrapper { 
    page-break-inside: avoid; /* 내용이 중간에 잘리지 않도록 노력 */
    border: 2px solid #1e293b !important;
    height: auto;
    min-height: 250mm; /* A4 한 페이지 꽉 차게 */
  } 
  body { 
    background: white; 
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
    font-size: 10.5pt; /* 인쇄 시 글자 크기 최적화 */
  }
}
.sidebar-btn { width: 100%; text-align: left; padding: 14px 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 8px; font-size: 13px; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: white; }
.sidebar-btn:hover { border-color: #3b82f6; background-color: #eff6ff; color: #1d4ed8; }
.sidebar-btn.active { border-color: #3b82f6; background-color: #2563eb; color: white; border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); }
.wb-header { border-bottom: 2px solid #1e293b; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
.wb-title { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; color: #1e293b; }
.wb-badge { background: #1e293b; color: white; padding: 4px 8px; font-size: 10px; font-weight: 800; border-radius: 4px; }
.vocab-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
.vocab-item { border-bottom: 1px solid #e2e8f0; padding: 6px 0; font-size: 12px; }
.confusable-box { background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 12px; border-radius: 0 8px 8px 0; margin-top: 16px; }
.correction-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
.correction-table th, .correction-table td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; }
.correction-table th { background-color: #f1f5f9; font-weight: 800; }
.ordering-box { background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 16px; font-weight: bold; color: #334155; line-height: 1.5; font-size: 13px; }
`;

export default function App() {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('top_english_key') || '';
    return '';
  });

  const [passages, setPassages] = useState([{ id: Date.now(), name: '', content: '' }]);
  const [workbooks, setWorkbooks] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPart, setLoadingPart] = useState<string | null>(null);
  const [viewPart, setViewPart] = useState('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handleKeyChange = (e: any) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('top_english_key', newKey);
    setErrorMsg(null);
  };

  const handleDownloadHTML = () => {
    if (!printRef.current) {
      setErrorMsg("다운로드 실패: 내용을 찾을 수 없습니다.");
      return;
    }

    const contentHTML = printRef.current.innerHTML;

    const fullHTML = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>Workbook Export</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: 'Malgun Gothic', sans-serif; padding: 0; margin: 0; background: white; }
          ${STYLES}
        </style>
      </head>
      <body>
        ${contentHTML}
      </body>
      </html>
    `;

    try {
      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Workbook_${new Date().toISOString().slice(0, 10)}.html`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("다운로드 중 오류가 발생했습니다.");
    }
  };

  const getPrompt = (partId: string, text: string) => {
    const base = `Act as an English Workbook Generator. Analyze this text: "${text}". Return ONLY valid JSON. No markdown blocks.`;
    switch (partId) {
      case 'p0': return `${base} Task: Extract 15 advanced vocabulary items. Schema: { "vocabulary": [{ "word": "...", "meaning": "...", "polysemy": "...", "antonym": "..." }], "confusables": [{ "wordA": "...", "meaningA": "...", "wordB": "...", "meaningB": "..." }] }`;
      case 'p1': return `${base} Task: Translate sentence by sentence. Schema: { "oneLineTranslation": ["..."] }`;
      case 'p2': return `${base} Task: Pick 5 key sentences for composition. Schema: { "sentenceComposition": [{ "translation": "...", "scrambled": "..." }] }`;
      case 'p3': return `${base} Task: Split text for ordering. Schema: { "sentenceScramble": { "firstSentence": "...", "scrambledSentences": ["...", "..."] } }`;
      case 'p4': return `${base} Task: Rewrite text with 8 grammar errors. Schema: { "grammarCorrection": { "incorrectParagraph": "...", "items": [{ "wrong": "...", "correct": "..." }] } }`;
      case 'p5': return `${base} Task: Fill in blanks. Schema: { "fillInTheBlanks": [{ "sentenceWithBlank": "...", "answers": ["..."] }] }`;
      case 'p6': return `${base} Task: T/F questions. Schema: { "contentCheck": [{ "question": "...", "answer": true }] }`;
      case 'p7': return `${base} Task: Full sentence writing. Schema: { "allSentencesTranslation": ["..."] }`;
      case 'p8': return `${base} Task: Word arrangement. Schema: { "wordArrangement": [{ "translation": "...", "scrambled": "..." }] }`;
      case 'p9': return `${base} Task: Writing with clues. Schema: { "writingWithClues": [{ "translation": "...", "clues": "..." }] }`;
      case 'p10': return `${base} Task: Summary. Schema: { "summary": { "originalSummary": "...", "summaryWithBlanks": "...", "answers": ["..."] } }`;
      default: return `${base} Task: Create ALL parts. Schema: { "vocabulary": [...], "oneLineTranslation": [...], "sentenceComposition": [...], "sentenceScramble": {...}, "grammarCorrection": {...}, "fillInTheBlanks": [...], "contentCheck": [...], "allSentencesTranslation": [...], "wordArrangement": [...], "writingWithClues": [...], "summary": {...} }`;
    }
  };

  const discoverModel = async (key: string) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if (!response.ok) throw new Error("API 키 확인 실패");

      const data = await response.json();
      if (!data.models) throw new Error("사용 가능한 모델 없음");

      const candidates = data.models.filter((m: any) =>
        m.name.includes("gemini") &&
        m.supportedGenerationMethods?.includes("generateContent")
      );

      if (candidates.length === 0) throw new Error("지원되는 Gemini 모델이 없습니다.");

      const best = candidates.find((m: any) => m.name.includes("1.5-flash")) ||
        candidates.find((m: any) => m.name.includes("1.5-pro")) ||
        candidates[0];

      return best.name.replace("models/", "");
    } catch (e) {
      console.warn("Model discovery failed, falling back to default.", e);
      return "gemini-1.5-flash";
    }
  };

  const handleGenerate = async (partId: string) => {
    setErrorMsg(null);
    setStatusMsg("📡 AI 모델 탐색 중...");

    const cleanKey = apiKey.trim();
    if (!cleanKey) { setErrorMsg('API Key를 입력해주세요.'); return; }

    const targets = passages.filter(p => p.content.trim());
    if (targets.length === 0) { setErrorMsg('내용이 입력된 지문이 없습니다.'); return; }

    setIsLoading(true);
    setLoadingPart(partId);
    setViewPart(partId);

    try {
      const modelName = await discoverModel(cleanKey);
      setStatusMsg(`🚀 연결됨: ${modelName} 모델로 생성 시작...`);

      const updatedWorkbooks = { ...workbooks };

      await Promise.all(targets.map(async (p) => {
        // [수정] 복구된 전체 파트 KeyMap (Part 0~10)
        const keyMap: any = {
          p0: 'vocabulary', p1: 'oneLineTranslation', p2: 'sentenceComposition',
          p3: 'sentenceScramble', p4: 'grammarCorrection', p5: 'fillInTheBlanks',
          p6: 'contentCheck', p7: 'allSentencesTranslation', p8: 'wordArrangement',
          p9: 'writingWithClues', p10: 'summary'
        };
        if (partId !== 'all' && updatedWorkbooks[p.id]?.data?.[keyMap[partId]]) return;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: getPrompt(partId, p.content) }] }] })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("AI 응답 내용이 비어있습니다.");

        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) throw new Error("AI 응답 데이터 오류 (JSON 파싱 실패).");

        const cleanJson = text.substring(jsonStart, jsonEnd + 1);
        const newData = JSON.parse(cleanJson);

        updatedWorkbooks[p.id] = {
          passageName: p.name || 'Untitled',
          data: { ...(updatedWorkbooks[p.id]?.data || {}), ...newData }
        };
      }));
      setWorkbooks(updatedWorkbooks);
      setStatusMsg(null);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`오류 발생: ${e.message}`);
      setStatusMsg(null);
    } finally {
      setIsLoading(false);
      setLoadingPart(null);
    }
  };

  const removePassage = (id: number) => {
    if (passages.length === 1) { setPassages([{ id: Date.now(), name: '', content: '' }]); return; }
    setPassages(passages.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
      <style>{STYLES}</style>

      <header className="h-16 bg-white border-b flex items-center justify-between px-8 no-print shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg font-black text-lg">TE</div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">TOP English <span className="text-blue-600">Workbook Pro</span></h1>
        </div>
      </header>

      {(errorMsg || statusMsg) && (
        <div className={`p-3 text-center font-bold no-print flex justify-between items-center px-8 shadow-lg z-[100] ${errorMsg ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
          <span>{errorMsg ? `⚠️ ${errorMsg}` : statusMsg}</span>
          <button onClick={() => { setErrorMsg(null); setStatusMsg(null); }} className="bg-white/20 text-white px-3 py-1 rounded text-xs hover:bg-white/30">닫기</button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white border-r p-6 no-print flex flex-col gap-6 shadow-sm z-10">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span>⚙️ Configuration</span></h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-2">Gemini API Key</label>
                <input type="password" value={apiKey} onChange={handleKeyChange} className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 ring-blue-100 bg-slate-50 focus:bg-white transition-all" placeholder="API Key 입력" />
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-[11px] text-blue-600 leading-relaxed font-medium">🤖 <strong>Smart Discovery:</strong><br />사용 가능한 최적의 모델을<br />자동으로 찾아 연결합니다.</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-10 no-print bg-[#f1f5f9]">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Passage Workshop</h2>
              <p className="text-slate-500 mt-2 font-medium">지문의 제목과 원문을 입력해주세요.</p>
            </div>
            {passages.map((p, idx) => (
              <div key={p.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 relative hover:border-blue-300 transition-all group">
                <button onClick={() => removePassage(p.id)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 p-2 transition-colors" title="삭제"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                <div className="mb-6 pr-10">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 block">Title</label>
                  <input className="w-full font-black text-2xl text-slate-800 outline-none placeholder:text-slate-300 bg-transparent border-b border-transparent focus:border-slate-200 transition-colors pb-1" placeholder="제목 (예: 20번)" value={p.name} onChange={(e) => { const n = [...passages]; n[idx].name = e.target.value; setPassages(n); }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Text</label>
                  <textarea className="w-full h-56 bg-slate-50 rounded-xl p-5 text-[15px] text-slate-700 leading-relaxed outline-none resize-none border-none focus:ring-2 ring-blue-50 transition-shadow" placeholder="영어 원문을 여기에 붙여넣으세요..." value={p.content} onChange={(e) => { const n = [...passages]; n[idx].content = e.target.value; setPassages(n); }} />
                </div>
              </div>
            ))}
            <button onClick={() => setPassages([...passages, { id: Date.now(), name: '', content: '' }])} className="w-full py-5 bg-white border-2 border-dashed border-slate-300 rounded-[2rem] text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"><span>+ 지문 추가하기</span></button>
          </div>
        </main>

        <aside className="w-80 bg-white border-l p-6 no-print overflow-y-auto flex flex-col z-10 shadow-xl">
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Actions</h2>
            <button onClick={() => handleGenerate('all')} disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm shadow-xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading && loadingPart === 'all' ? <><span className="animate-spin">⏳</span> 생성 중...</> : "⚡ 전체 워크북 생성"}
            </button>
          </div>
          <div className="space-y-1 flex-1 overflow-y-auto pr-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Individual Parts</p>
            {[
              { id: 'p0', name: 'Part 0. 주요 어휘', icon: '📝' },
              { id: 'p1', name: 'Part 1. 한줄 해석', icon: '📖' },
              { id: 'p2', name: 'Part 2. 중요 문장 영작', icon: '✍️' },
              { id: 'p3', name: 'Part 3. 순서 배열', icon: '🔢' },
              { id: 'p4', name: 'Part 4. 어법 고치기', icon: '🔍' },
              { id: 'p5', name: 'Part 5. 빈칸 채우기', icon: '🕳️' },
              { id: 'p6', name: 'Part 6. 내용 일치', icon: '✅' },
              { id: 'p7', name: 'Part 7. 통문장 영작', icon: '🖋️' },
              { id: 'p8', name: 'Part 8. 단어 배열', icon: '🧩' },
              { id: 'p9', name: 'Part 9. 어구 제시', icon: '💡' },
              { id: 'p10', name: 'Part 10. 요약문', icon: '📊' }
            ].map(part => (
              <button key={part.id} onClick={() => handleGenerate(part.id)} disabled={isLoading} className={`sidebar-btn ${viewPart === part.id ? 'active' : ''}`}>
                <div className="flex items-center gap-3"><span className="text-base">{part.icon}</span> <span>{part.name}</span></div>
                {isLoading && loadingPart === part.id ? <span className="animate-spin text-xs">⏳</span> : <span className="text-[10px] opacity-40 font-bold">GO</span>}
              </button>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">

            <button onClick={handleDownloadHTML} className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-bold border border-blue-100 text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">📥 HTML 다운로드</button>
          </div>
        </aside>
      </div>

      <div ref={printRef} className="max-w-[210mm] mx-auto w-full p-10 space-y-20 bg-white mt-10 mb-20 shadow-2xl">
        {Object.keys(workbooks).length === 0 && <div className="text-center text-slate-300 py-40 no-print flex flex-col items-center"><div className="text-4xl mb-4">📄</div><div className="font-bold text-lg">생성된 워크북이 없습니다.</div><div className="text-sm font-normal mt-2">지문을 입력하고 우측 버튼을 눌러주세요.</div></div>}

        {passages.filter(p => workbooks[p.id]).map((p) => {
          const wb = workbooks[p.id];
          const data = wb.data;
          if (!data) return null;

          return (
            <div key={p.id} className="passage-section">
              {(viewPart === 'all' || viewPart === 'p0') && data.vocabulary && (
                <section className="exam-wrapper p-10 mb-12 page-break">
                  <div className="wb-header"><h2 className="wb-title">Vocabulary Mastery</h2><span className="wb-badge">PART 00</span></div>
                  <div className="mb-6 font-bold text-xl border-b-2 border-slate-100 pb-3">{wb.passageName}</div>
                  <div className="vocab-grid">
                    {data.vocabulary.map((v: any, i: number) => (
                      <div key={i} className="flex flex-col mb-4">
                        <div className="vocab-item flex justify-between items-end"><span className="font-extrabold text-lg text-slate-800">{v.word}</span><span className="text-sm text-slate-500 font-medium">{v.meaning}</span></div>
                        {(v.polysemy || v.antonym) && (<div className="flex gap-2 mt-1">{v.polysemy && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 rounded font-bold">다의: {v.polysemy}</span>}{v.antonym && <span className="text-[10px] text-red-500 bg-red-50 px-1.5 rounded font-bold">반의: {v.antonym}</span>}</div>)}
                      </div>
                    ))}
                  </div>
                  {data.confusables && (
                    <div className="confusable-box">
                      <h3 className="text-xs font-black text-red-600 uppercase mb-3 flex items-center gap-2"><span>⚠️ Confusion Alert</span><div className="h-px bg-red-200 flex-1"></div></h3>
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        {data.confusables.map((c: any, i: number) => (<div key={i} className="bg-white p-3 rounded border border-red-100"><div className="font-bold text-slate-800">{c.wordA} <span className="font-normal text-xs text-slate-500">({c.meaningA})</span></div><div className="border-t border-dashed border-red-200 my-1"></div><div className="font-bold text-slate-800">{c.wordB} <span className="font-normal text-xs text-slate-500">({c.meaningB})</span></div></div>))}
                      </div>
                    </div>
                  )}
                </section>
              )}
              {(viewPart === 'all' || viewPart === 'p1') && data.oneLineTranslation && (
                <section className="exam-wrapper p-10 mb-12 page-break">
                  <div className="wb-header" style={{ borderBottomColor: '#2563eb' }}><h2 className="wb-title text-blue-700">Translation</h2><span className="wb-badge bg-blue-600">PART 01</span></div>
                  <div className="space-y-8">{data.oneLineTranslation.map((s: string, i: number) => (<div key={i} className="mb-6"><p className="font-bold mb-3 leading-relaxed text-[15px]"><span className="text-blue-600 mr-2 text-lg font-black">{i + 1}.</span>{s}</p><div className="border-b border-slate-200 h-10"></div></div>))}</div>
                </section>
              )}
              {(viewPart === 'all' || viewPart === 'p2') && data.sentenceComposition && (
                <section className="exam-wrapper p-10 mb-12 page-break"><div className="wb-header"><h2 className="wb-title">Key Sentences</h2><span className="wb-badge">PART 02</span></div><div className="space-y-10">{data.sentenceComposition.map((item: any, i: number) => (<div key={i} className="mb-6"><p className="font-bold mb-3 text-lg"><span className="text-blue-600 mr-2">{i + 1}.</span>{item.translation}</p><div className="text-sm text-slate-500 bg-slate-50 p-3 mb-3 rounded border border-slate-200 font-medium">조건: {item.scrambled}</div><div className="border-b border-slate-200 h-10"></div></div>))}</div></section>
              )}
              {(viewPart === 'all' || viewPart === 'p3') && data.sentenceScramble && (
                <section className="exam-wrapper p-10 mb-12 page-break"><div className="wb-header"><h2 className="wb-title">Ordering</h2><span className="wb-badge">PART 03</span></div><div className="ordering-box text-justify mb-8">{data.sentenceScramble.firstSentence}</div><div className="space-y-6">{data.sentenceScramble.scrambledSentences.map((s: string, i: number) => (<div key={i} className="flex gap-4"><span className="font-black text-xl text-blue-600 pt-1">({String.fromCharCode(65 + i)})</span><p className="text-justify leading-relaxed flex-1 text-[15px] font-medium text-slate-700">{s}</p></div>))}</div></section>
              )}
              {(viewPart === 'all' || viewPart === 'p4') && data.grammarCorrection && (
                <section className="exam-wrapper p-10 mb-12 page-break"><div className="wb-header"><h2 className="wb-title">Grammar Correction</h2><span className="wb-badge">PART 04</span></div><div className="bg-slate-50 p-8 rounded-xl mb-8 text-justify leading-[2.2] text-[15px] border border-slate-200">{data.grammarCorrection.incorrectParagraph}</div><table className="correction-table"><thead><tr><th className="w-16">No.</th><th>Wrong Expression</th><th>Correct Expression</th></tr></thead><tbody>{[1, 2, 3, 4, 5, 6, 7, 8].map(n => <tr key={n}><td className="font-bold text-blue-600">({n})</td><td></td><td></td></tr>)}</tbody></table></section>
              )}
              {(viewPart === 'all' || viewPart === 'p5') && data.fillInTheBlanks && (
                <section className="exam-wrapper p-10 mb-12 page-break"><div className="wb-header"><h2 className="wb-title">Blanks</h2><span className="wb-badge">PART 05</span></div><div className="space-y-5 leading-[2.5] text-justify text-[15px]">{data.fillInTheBlanks.map((item: any, i: number) => (<span key={i} className="inline"><sup className="text-blue-600 font-bold mx-1">[{i + 1}]</sup>{item.sentenceWithBlank} </span>))}</div></section>
              )}
              {(viewPart === 'all' || viewPart === 'p6') && data.contentCheck && (
                <section className="exam-wrapper p-10 mb-12 page-break"><div className="wb-header"><h2 className="wb-title">Content Check</h2><span className="wb-badge">PART 06</span></div><div className="space-y-6">{data.contentCheck.map((q: any, i: number) => (<div key={i} className="flex justify-between items-center border-b border-slate-100 pb-4"><p className="font-bold text-[15px]"><span className="mr-3 text-blue-600 font-black">{i + 1}.</span>{q.question}</p><span className="font-black text-slate-300 tracking-[0.3em] ml-4">( T / F )</span></div>))}</div></section>
              )}
              {(viewPart === 'all' || viewPart === 'p7') && data.allSentencesTranslation && (
                <section className="exam-wrapper p-10 mb-12 page-break"><div className="wb-header"><h2 className="wb-title">Full Writing</h2><span className="wb-badge">PART 07</span></div><div className="space-y-10">{data.allSentencesTranslation.map((s: string, i: number) => (<div key={i} className="mb-6"><p className="font-bold mb-8 text-lg"><span className="text-blue-600 mr-2">{i + 1}.</span>{s}</p><div className="border-b border-slate-200 h-1"></div></div>))}</div></section>
              )}
              {(viewPart === 'all' || viewPart === 'p8') && data.wordArrangement && (
                <section className="exam-wrapper p-10 mb-12 page-break"><div className="wb-header"><h2 className="wb-title">Arrangement</h2><span className="wb-badge">PART 08</span></div><div className="space-y-8">{data.wordArrangement.map((item: any, i: number) => (<div key={i} className="mb-6"><p className="font-bold mb-2">{i + 1}. {item.translation}</p><div className="text-xs text-slate-500 bg-slate-50 p-2 mb-4 rounded italic">{item.scrambled}</div><div className="border-b border-slate-200 h-8"></div></div>))}</div></section>
              )}
              {(viewPart === 'all' || viewPart === 'p9') && data.writingWithClues && (
                <section className="exam-wrapper p-10 mb-12 page-break"><div className="wb-header"><h2 className="wb-title">Guided Writing</h2><span className="wb-badge">PART 09</span></div><div className="space-y-8">{data.writingWithClues.map((item: any, i: number) => (<div key={i} className="mb-6"><p className="font-bold mb-2">{i + 1}. {item.translation}</p><div className="text-xs text-blue-600 bg-blue-50 p-2 mb-4 rounded font-bold">[보기] {item.clues}</div><div className="border-b border-slate-200 h-8"></div></div>))}</div></section>
              )}
              {(viewPart === 'all' || viewPart === 'p10') && data.summary && (
                <section className="exam-wrapper p-10 mb-12 page-break"><div className="wb-header"><h2 className="wb-title">Summary</h2><span className="wb-badge">PART 10</span></div><div className="bg-slate-50 p-8 rounded-xl border border-slate-200 leading-loose text-justify text-lg mb-8 font-medium text-slate-700">{data.summary.summaryWithBlanks}</div><div className="border-2 border-slate-200 border-dashed p-6 rounded-xl text-center"><span className="font-black text-xs bg-slate-800 text-white px-3 py-1 rounded mr-2 uppercase tracking-wider">Keywords</span><span className="text-slate-400 text-sm italic"> (Fill in the blanks with the correct words) </span></div></section>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
