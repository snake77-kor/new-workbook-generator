import React, { useState, useRef } from 'react';

// -----------------------------------------------------------------------------
// 1. 스타일 정의 (New Design System + A4 Full Optimization)
// -----------------------------------------------------------------------------
const STYLES = `
@page { size: A4; margin: 10mm; }
@media print { 
  .no-print { display: none !important; } 
  .page-break { page-break-after: always; }
  .exam-wrapper { 
    page-break-inside: avoid; 
    height: auto;
    min-height: 250mm;
    display: block !important;
  }
}

/* Base Styles */
body { 
  background: white; 
  -webkit-print-color-adjust: exact; 
  print-color-adjust: exact; 
  font-size: 10.5pt;
  font-family: 'Malgun Gothic', sans-serif;
  color: #1e293b; 
}

/* UI Components */
.sidebar-btn { width: 100%; text-align: left; padding: 14px 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 8px; font-size: 13px; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: white; }
.sidebar-btn:hover { border-color: #3b82f6; background-color: #eff6ff; color: #1d4ed8; }
.sidebar-btn.active { border-color: #3b82f6; background-color: #2563eb; color: white; border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); }
.gen-all-btn { background-color: #2563eb !important; color: white !important; border: none !important; opacity: 1 !important; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4); }

/* --- PREMIUM BLUE DESIGN --- */
.main-title-bar {
  background: linear-gradient(to right, #1e40af, #3b82f6);
  border-radius: 50px;
  padding: 8px 24px;
  color: white;
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  margin-bottom: 24px;
  -webkit-print-color-adjust: exact;
}
.main-title-text { font-size: 16px; letter-spacing: -0.5px; text-transform: uppercase; }

.question-header { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 12px; }
.question-badge {
  width: 60px;
  height: 52px;
  background: #2563eb;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 900;
  font-size: 18px;
  flex-shrink: 0;
  -webkit-print-color-adjust: exact;
}

.part-title-ribbon {
  flex: 1;
  background: white;
  border-bottom: 3px solid #2563eb;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;
}
.step-label {
  background: #1e293b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  -webkit-print-color-adjust: exact;
}
.part-name {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  text-transform: uppercase;
}

.passage-box {
  background: white;
  border: 2px solid #dbeafe;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  line-height: 2.0;
  font-size: 15px;
  color: #334155;
  text-align: justify;
  min-height: 200px;
}

.loading-box {
  width: 100%;
  height: 200px;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  color: #94a3b8;
  gap: 12px;
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0% {opacity:1;} 50% {opacity:0.6;} 100% {opacity:1;} }
.error-box {
    width: 100%;
    padding: 40px;
    background-color: #fef2f2;
    border: 2px dashed #fca5a5;
    border-radius: 12px;
    color: #ef4444;
    text-align: center;
    font-weight: bold;
}

.translation-divider {
  border-top: 2px dashed #e2e8f0;
  margin: 32px 0 24px 0;
  position: relative;
}
.translation-divider::after {
  content: 'Translation / Guide';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 0 12px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: bold;
}
.translation-text { color: #64748b; font-size: 13px; line-height: 1.6; }

[contenteditable="true"]:focus { outline: 2px dashed #3b82f6; background-color: #eff6ff; border-radius: 4px; padding: 2px; }

.vocab-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
.vocab-table th { background-color: #1e40af; color: white; padding: 10px; text-align: left; font-size: 14px; border: 1px solid #1e40af; }
.vocab-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; vertical-align: top; }
.vocab-table tr:last-child td { border-bottom: none; }
.vocab-word { font-weight: 800; font-size: 15px; color: #1e293b; }
.vocab-mean { font-weight: 600; color: #3b82f6; }
.vocab-meta { font-size: 12px; color: #64748b; line-height: 1.4; }
.confusable-section { margin-top: 32px; border-top: 2px dashed #cbd5e1; padding-top: 20px; }
.confusable-title { font-weight: 800; color: #ef4444; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-size: 16px; }
.confusable-grid { display: grid; grid-template-cols: 1fr; gap: 12px; }
.confusable-item { background: #fff1f2; padding: 12px; border-radius: 8px; border: 1px solid #fecdd3; display: flex; align-items: center; justify-content: space-between; }
.confusable-word { font-weight: 700; color: #9f1239; }

.ordering-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-weight: 600; }
.abc-block { margin-top: 16px; display: flex; gap: 12px; }
.abc-label { font-weight: 900; color: #2563eb; font-size: 18px; min-width: 24px; }
u { text-underline-offset: 5px; text-decoration-color: #3b82f6; font-weight: 700; padding: 0 4px; text-decoration-thickness: 3px; }
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isStudentMode, setIsStudentMode] = useState(false);
  const [failedPassages, setFailedPassages] = useState<Set<number>>(new Set());

  const printRef = useRef<HTMLDivElement>(null);

  const handleKeyChange = (e: any) => {
    setApiKey(e.target.value);
    localStorage.setItem('top_english_key', e.target.value);
  };

  const handleDownloadHTML = () => {
    if (!printRef.current) return;
    const contentHTML = printRef.current.innerHTML;
    const fullHTML = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>Workbook</title><script src="https://cdn.tailwindcss.com"></script><style>${STYLES}</style></head><body>${contentHTML}</body></html>`;
    try {
      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Workbook_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (e) { console.error(e); setErrorMsg("다운로드 오류"); }
  };

  const getPrompt = (partId: string, text: string) => {
    // Explicitly ask for JSON
    const base = `Act as an English Workbook Generator. Analyze this text: "${text}". You MUST return a valid JSON object.`;
    switch (partId) {
      case 'p0': return `${base} Task: Extract 12 advanced words with synonyms/antonyms. Also find 2 pairs of confusable words. IMPORTANT: Meanings (mean, m1, m2) MUST be in KOREAN. Schema: { "vocabulary": [{ "word": "...", "mean": "...", "syn": "...", "ant": "..." }], "confusable": [{ "w1": "...", "m1": "...", "w2": "...", "m2": "..." }] }`;
      case 'p1': return `${base} Task: Translate sentence by sentence. Schema: { "translation": [{ "en": "...", "ko": "..." }] }`;
      case 'p2': return `${base} Task: Select 5 key sentences. Provide Korean translation and a scrambled list of words for writing practice. Schema: { "keySentences": [{ "ko": "...", "words": ["word1", "word2", "..."] }] }`;
      case 'p3': return `${base} Task: Create an ordering problem. 1. Identify the first sentence. 2. Scramble the REST of the sentences. Schema: { "ordering": { "firstSentence": "...", "scrambledSentences": ["...", "...", "..."] } }`;
      case 'p4': return `${base} Task: Grammar Correction. 1. Generate "incorrectParagraph": You MUST include the ENTIRE original text. In this text, mark 8 grammatical points with circled numbers and underlines (e.g. ① <u>word</u>). 3-4 of these MUST be grammatically incorrect forms that need correction. 2. Generate "corrections": Check list for all 8 points. Schema: { "grammar": { "incorrectParagraph": "<p>...Full text with tags...</p>", "corrections": [{ "num": 1, "word": "...", "correct": "...", "reason": "..." }] } }`;
      case 'p5': return `${base} Task: Blanks with hints (a_______). Schema: { "blanks": { "text": "...", "ko": "..." } }`;
      case 'p6': return `${base} Task: 5 T/F questions. Schema: { "tf": [{ "q": "...", "a": true }] }`;
      case 'p7': return `${base} Task: Full text translation. Schema: { "fullTranslation": [{ "en": "...", "ko": "..." }] }`;
      case 'p8': return `${base} Task: Word Arrangement (Scramble) 3 sentences. Schema: { "arrangement": [{ "scrambled": "...", "ko": "..." }] }`;
      case 'p9': return `${base} Task: Guided writing with clues (3 sentences). Schema: { "guided": [{ "ko": "...", "clue": "..." }] }`;
      case 'p10': return `${base} Task: Summary with 3 keyword blanks. Schema: { "summary": { "text": "...", "keywords": ["..."] } }`;
      default: return `${base} Task: Create ALL parts. Schema: { "vocabulary":..., "translation":..., "keySentences":..., "ordering":..., "grammar":..., "blanks":..., "tf":..., "fullTranslation":..., "arrangement":..., "guided":..., "summary":... }`;
    }
  };

  const discoverModel = async (key: string) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if (!response.ok) throw new Error("API 키 확인 실패");
      const data = await response.json();
      if (!data.models) return "gemini-1.5-flash";
      const best = data.models.find((m: any) => m.name.includes("gemini-1.5-pro")) || data.models.find((m: any) => m.name.includes("flash")) || data.models[0];
      return best.name.replace("models/", "");
    } catch (e) { return "gemini-1.5-flash"; }
  };

  const fetchWithRetry = async (url: string, options: any, retries = 1): Promise<any> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429 && retries > 0) {
          await delay(3000);
          return fetchWithRetry(url, options, retries - 1);
        }
        const errBody = await response.json();
        throw new Error(`API Error ${response.status}: ${errBody.error?.message || response.statusText}`);
      }
      return response.json();
    } catch (e) {
      if (retries > 0) {
        await delay(3000);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw e;
    }
  };

  const handleGenerate = async (partId: string) => {
    setErrorMsg(null); setStatusMsg("📡 AI 모델 탐색 등...");
    const cleanKey = apiKey.trim();
    if (!cleanKey) { setErrorMsg('API Key를 입력해주세요.'); return; }
    const targets = passages.filter(p => p.content.trim());
    if (targets.length === 0) { setErrorMsg('지문 없음'); return; }

    setIsLoading(true); setLoadingPart(partId); setViewPart(partId); setProgress({ current: 0, total: targets.length });
    setFailedPassages(new Set());

    try {
      const modelName = await discoverModel(cleanKey);

      for (let i = 0; i < targets.length; i++) {
        const p = targets[i];
        setProgress({ current: i + 1, total: targets.length });
        setStatusMsg(`🚀 [${i + 1}/${targets.length}] ${modelName} 생성 중...`);

        try {
          const data = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              // Enable JSON mode in config for safer parsing
              body: JSON.stringify({
                contents: [{ parts: [{ text: getPrompt(partId, p.content) }] }],
                generationConfig: { responseMimeType: "application/json" }
              })
            }
          );

          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) throw new Error('No generated text found.');

          // More robust JSON parsing
          let newData;
          try {
            newData = JSON.parse(text);
          } catch (e) {
            // Fallback: try finding json block if JSON mode wasn't perfect
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              newData = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
            } else {
              throw new Error("Invalid JSON structure");
            }
          }

          setWorkbooks((prev: any) => ({
            ...prev, [p.id]: { passageName: p.name || `Unit ${i + 1}`, data: { ...(prev[p.id]?.data || {}), ...newData } }
          }));

        } catch (innerErr: any) {
          console.error("Passage Gen Error", innerErr);
          setFailedPassages(prev => new Set(prev).add(p.id));
          // Continue to next passage 
        }

        if (i < targets.length - 1) { setStatusMsg("⏳ 쿨다운 (2.5초)..."); await delay(2500); }
      }
      setStatusMsg("✅ 완료!"); setTimeout(() => setStatusMsg(null), 4000);
    } catch (e: any) { setErrorMsg(e.message); } finally { setIsLoading(false); setLoadingPart(null); setProgress({ c: 0, t: 0 }); }
  };

  const removePassage = (id: number) => {
    if (passages.length === 1) { setPassages([{ id: Date.now(), name: '', content: '' }]); return; }
    setPassages(passages.filter(p => p.id !== id));
  };

  const renderWorkbookCard = (passageName: string, partName: string, step: string, contentNode: React.ReactNode, translation?: string) => (
    <div className="exam-wrapper p-10 mb-12 page-break">
      <div className="main-title-bar"><span className="main-title-text">Top English Workbook Pro</span><span className="text-xs opacity-80">High School English</span></div>
      <div className="question-header">
        <div className="question-badge">{passageName.replace(/[^0-9]/g, '') || 'Q'}</div>
        <div className="part-title-ribbon"><span className="step-label">{step}</span><span className="part-name">{partName}</span></div>
      </div>
      <div className="passage-box">
        {contentNode}
        {(!isStudentMode && translation) && <><div className="translation-divider"></div><div className="translation-text" contentEditable suppressContentEditableWarning>{translation}</div></>}
      </div>
    </div>
  );

  const editProps = { contentEditable: true, suppressContentEditableWarning: true };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
      <style>{STYLES}</style>
      <header className="h-16 bg-white border-b flex items-center justify-between px-8 no-print shadow-sm z-50">
        <div className="flex items-center gap-3"><div className="bg-blue-600 text-white p-1.5 rounded-lg font-black text-lg">TE</div><h1 className="text-xl font-black text-slate-800">TOP English</h1></div>
      </header>
      {isLoading && progress.total > 0 && <div className="w-full h-1.5 bg-slate-100 no-print"><div className="h-full bg-blue-600 transition-all" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div></div>}
      {(errorMsg || statusMsg) && <div className={`p-3 text-center font-bold no-print text-white ${errorMsg ? 'bg-red-500' : 'bg-blue-600'}`}>{errorMsg || statusMsg}</div>}

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white border-r p-6 no-print flex flex-col gap-6 shadow-sm z-10 overflow-y-auto">
          <div>
            <h2 className="text-sm font-bold text-slate-500 mb-4">Configuration</h2>
            <input type="password" value={apiKey} onChange={handleKeyChange} className="w-full border p-2 rounded mb-4" placeholder="API Key" />
            <div className="flex gap-2"><button onClick={() => setIsStudentMode(false)} className={`flex-1 py-2 text-xs rounded border ${!isStudentMode ? 'bg-blue-600 text-white' : 'bg-white'}`}>강사용</button><button onClick={() => setIsStudentMode(true)} className={`flex-1 py-2 text-xs rounded border ${isStudentMode ? 'bg-green-600 text-white' : 'bg-white'}`}>학생용</button></div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            <button onClick={() => handleGenerate('all')} className="sidebar-btn gen-all-btn mb-4" style={{ minHeight: '56px', whiteSpace: 'nowrap', justifyContent: 'center' }}>
              {isLoading && loadingPart === 'all' ? <><span className="animate-spin mr-2 flex-shrink-0">⌛</span>생성 중...</> : "⚡ 전체 워크북 생성"}
            </button>
            {['어휘', '해석', '중요문장 영작', '글의 순서', '어법 고치기', '빈칸', '내용', '통문장', '배열', '조건', '요약'].map((n, i) => (<button key={i} onClick={() => handleGenerate(`p${i}`)} className={`sidebar-btn ${viewPart === `p${i}` ? 'active' : ''}`}>Part {i}. {n}</button>))}
          </div>
          <button onClick={handleDownloadHTML} className="w-full bg-blue-50 text-blue-600 py-3 rounded font-bold text-xs mt-4">HTML 다운로드</button>
        </aside>

        <main className="flex-1 overflow-y-auto p-10 no-print bg-[#f1f5f9]">
          {passages.map((p, i) => (
            <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-slate-200">
              <div className="flex justify-between mb-4"><input className="font-bold text-lg outline-none" placeholder="Title (e.g. 20)" value={p.name} onChange={e => { const n = [...passages]; n[i].name = e.target.value; setPassages(n) }} /><button onClick={() => { if (passages.length === 1) return; setPassages(passages.filter(it => it.id !== p.id)) }} className="text-red-400">삭제</button></div>
              <textarea className="w-full h-40 bg-slate-50 p-4 rounded-xl resize-none outline-none" value={p.content} onChange={e => { const n = [...passages]; n[i].content = e.target.value; setPassages(n) }} placeholder="Content..." />
            </div>
          ))}
          <button onClick={() => setPassages([...passages, { id: Date.now(), name: '', content: '' }])} className="w-full py-4 bg-white border-2 border-dashed rounded-xl">+ Add Passage</button>
        </main>
      </div>

      <div ref={printRef} className="max-w-[210mm] mx-auto w-full p-10 space-y-20 bg-white mt-10 mb-20 shadow-2xl">
        <section className="cover-page exam-wrapper page-break flex flex-col items-center justify-center p-20 text-center select-none bg-white">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">TOP ENGLISH ACADEMY</h1>
          <div className="w-24 h-2 bg-slate-900 mb-12"></div>
          <h2 className="text-6xl font-black text-slate-800 mb-20 leading-tight">ENGLISH<br /><span className="text-blue-600">WORKBOOK PRO</span></h2>
          <div className="w-full max-w-lg space-y-6">
            {['Student Name', 'Date', 'Score'].map(L => <div key={L} className="flex items-end gap-4"><span className="w-32 text-right font-bold text-slate-500">{L}</span><div className="flex-1 border-b-2 border-slate-300 h-8"></div></div>)}
          </div>
          <div className="mt-auto text-xs font-bold text-slate-400">ⓒ TOP ENGLISH ACADEMY. All rights reserved.</div>
        </section>

        {passages.map(p => {
          const wb = workbooks[p.id] || { passageName: p.name || 'Title', data: {} };
          const rawData = wb.data || {};
          // Helper functions to normalize data types
          const ensureArray = (d: any) => Array.isArray(d) ? d : (d ? [d] : []);
          const ensureObject = (d: any) => Array.isArray(d) ? (d[0] || {}) : (d || {});

          const data: any = {
            vocabulary: ensureArray(rawData.vocabulary),
            confusable: ensureArray(rawData.confusable),
            translation: ensureArray(rawData.translation),
            keySentences: ensureArray(rawData.keySentences),
            ordering: ensureObject(rawData.ordering),
            grammar: ensureObject(rawData.grammar),
            blanks: ensureObject(rawData.blanks),
            tf: ensureArray(rawData.tf),
            fullTranslation: ensureArray(rawData.fullTranslation),
            arrangement: ensureArray(rawData.arrangement),
            guided: ensureArray(rawData.guided),
            summary: ensureObject(rawData.summary),
          };
          const name = wb.passageName;
          const isFailed = failedPassages.has(p.id);

          const isTarget = (k: string) => (viewPart === 'all' || viewPart === k);
          const hasData = (d: any) => (d && (Array.isArray(d) ? d.length > 0 : Object.keys(d).length > 0));

          const Part = (key: string, title: string, step: string, content: React.ReactNode, showTranslationDiv: boolean = true) => {
            if (!isTarget(key)) return null;
            const map: any = {
              p0: 'vocabulary', p1: 'translation', p2: 'keySentences', p3: 'ordering',
              p4: 'grammar', p5: 'blanks', p6: 'tf', p7: 'fullTranslation',
              p8: 'arrangement', p9: 'guided', p10: 'summary'
            };
            const dataKey = map[key];
            const realData = data[dataKey];

            // Render FRAME first, then content or loading. 
            // This prevents "white screen" because the component structure always exists.
            let inner = content;
            if (!hasData(realData)) {
              if (isFailed) {
                inner = <div className="error-box">생성 실패: 잠시 후 다시 시도해주세요.</div>
              } else {
                // Keep the structure but show loading text
                inner = (
                  <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-slate-400">
                    <div className="animate-spin text-2xl mb-2">⌛</div>
                    <div className="font-bold">AI가 문제를 생성하고 있습니다...</div>
                  </div>
                );
              }
            }

            return renderWorkbookCard(name, title, step, inner, showTranslationDiv ? 'Translation' : undefined);
          };

          return (
            <div key={p.id}>
              {Part('p0', 'Vocabulary Mastery', 'PART 00',
                <div>
                  <table className="vocab-table">
                    <thead><tr><th style={{ width: '25%' }}>Word</th><th style={{ width: '25%' }}>Meaning</th><th style={{ width: '25%' }}>Synonym</th><th style={{ width: '25%' }}>Antonym</th></tr></thead>
                    <tbody>
                      {Array.isArray(data.vocabulary) && data.vocabulary.map((v: any, k: number) => (
                        <tr key={k}>
                          <td><div className="vocab-word" {...editProps}>{v?.word}</div></td>
                          <td><div className="vocab-mean" {...editProps}>{!isStudentMode && v?.mean}</div></td>
                          <td><div className="vocab-meta" {...editProps}>{!isStudentMode && v?.syn}</div></td>
                          <td><div className="vocab-meta" {...editProps}>{!isStudentMode && v?.ant}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.confusable && data.confusable.length > 0 && (
                    <div className="confusable-section">
                      <div className="confusable-title">⚠️ Confusable Words</div>
                      <div className="confusable-grid">
                        {data.confusable.map((c: any, k: number) => (
                          <div key={k} className="confusable-item">
                            <div><span className="confusable-word">{c?.w1}</span> <span className="text-sm text-slate-600">({!isStudentMode && c?.m1})</span></div>
                            <div className="text-slate-400 font-bold text-xs mx-4">VS</div>
                            <div className="text-right"><span className="confusable-word">{c?.w2}</span> <span className="text-sm text-slate-600">({!isStudentMode && c?.m2})</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {Part('p1', 'One-Line Translation', 'PART 01', <div className="space-y-6">{Array.isArray(data.translation) && data.translation.map((s: any, k: number) => <div key={k}><div className="font-medium leading-relaxed mb-3" {...editProps}><span className="text-blue-600 font-bold mr-2">{k + 1}.</span>{s?.en}</div><div className="pl-6 border-b border-slate-300 h-8 mb-2"></div></div>)}</div>, false)}
              {Part('p2', '중요문장 영작', 'PART 02', <div className="space-y-10">{Array.isArray(data.keySentences) && data.keySentences.map((s: any, k: number) => <div key={k}><div className="font-bold text-lg mb-2" {...editProps}>{k + 1}. {s?.ko}</div><div className="text-sm bg-blue-50 text-blue-800 p-3 rounded mb-4" {...editProps}>Hint: {Array.isArray(s?.words) ? s.words.join(' / ') : ''}</div><div className="border-b border-slate-300 h-8"></div></div>)}</div>, false)}
              {Part('p3', '글의 순서', 'PART 03', <div><div className="ordering-box" {...editProps}>{data.ordering?.firstSentence}</div><div className="space-y-4 mb-8">{Array.isArray(data.ordering?.scrambledSentences) && data.ordering?.scrambledSentences.map((s: string, k: number) => <div key={k} className="flex gap-3"><div className="font-bold text-blue-600 text-lg flex-shrink-0">{['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][k] || (k + 1)}</div><div className="leading-relaxed" {...editProps}>{s}</div></div>)}</div><div className="border-t-2 border-slate-200 pt-4 flex items-end gap-2"><span className="font-bold text-slate-700">Answer:</span><div className="border-b-2 border-slate-300 w-48"></div></div></div>, false)}
              {Part('p4', '어법 고치기', 'PART 04',
                <div>
                  <div className="passage-box mb-8" style={{ minHeight: '150px', lineHeight: '2.2' }}>
                    {data.grammar?.incorrectParagraph
                      ? <div dangerouslySetInnerHTML={{ __html: data.grammar.incorrectParagraph }} {...editProps} />
                      : <div className="h-full flex items-center justify-center text-slate-400 italic">지문을 생성하고 있습니다...</div>
                    }
                  </div>
                  <table className="vocab-table">
                    <thead><tr><th style={{ width: '8%' }}>No.</th><th style={{ width: '27%' }}>Expression</th><th style={{ width: '27%' }}>Correction</th><th style={{ width: '38%' }}>Reason</th></tr></thead>
                    <tbody>
                      {Array.isArray(data.grammar?.corrections) && data.grammar.corrections.map((c: any, k: number) => (
                        <tr key={k}>
                          <td className="font-bold text-center text-blue-600">{c?.num ? (['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][c.num - 1] || c.num) : (k + 1)}</td>
                          <td className="font-bold">{c?.word}</td>
                          <td className="text-blue-600 font-bold">{!isStudentMode && c?.correct}</td>
                          <td className="text-xs text-slate-500">{!isStudentMode && c?.reason}</td>
                        </tr>
                      ))}
                      {(!data.grammar?.corrections || data.grammar.corrections.length === 0) && [1, 2, 3, 4, 5, 6, 7, 8].map(i => <tr key={i}><td className="font-bold text-center text-blue-600">{['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][i - 1]}</td><td></td><td></td><td></td></tr>)}
                    </tbody>
                  </table>
                </div>
                , false)}
              {Part('p5', 'Fill In Blanks', 'PART 05', <div className="leading-loose text-justify" {...editProps}>{data.blanks?.text}</div>, data.blanks?.ko)}
              {Part('p6', 'Content Check', 'PART 06', <div className="space-y-4">{Array.isArray(data.tf) && data.tf.map((q: any, k: number) => <div key={k} className="flex justify-between border-b pb-2 items-center"><span {...editProps}>{k + 1}. {q?.q}</span><span className="font-bold font-mono ml-4 text-slate-400">{!isStudentMode ? (q?.a ? '( T )' : '( F )') : '(   )'}</span></div>)}</div>)}
              {Part('p7', 'Full Writing', 'PART 07', <div className="space-y-8">{Array.isArray(data.fullTranslation) && data.fullTranslation.map((s: any, k: number) => <div key={k}><div className="font-bold mb-2" {...editProps}>{k + 1}. {s?.en}</div><div className="border-b border-slate-300 h-8"></div></div>)}</div>)}
              {Part('p8', 'Word Arrangement', 'PART 08', <div className="space-y-8">{Array.isArray(data.arrangement) && data.arrangement.map((s: any, k: number) => <div key={k}><div className="font-bold mb-2" {...editProps}>{k + 1}. {s?.ko}</div><div className="text-sm bg-slate-50 p-2 rounded text-slate-500 italic mb-4" {...editProps}>{s?.scrambled}</div><div className="border-b border-slate-300 h-8"></div></div>)}</div>)}
              {Part('p9', 'Guided Writing', 'PART 09', <div className="space-y-8">{Array.isArray(data.guided) && data.guided.map((s: any, k: number) => <div key={k}><div className="font-bold mb-2" {...editProps}>{k + 1}. {s?.ko}</div><div className="text-xs font-bold text-blue-600 mb-4">[조건] <span {...editProps}>{s?.clue}</span></div><div className="border-b border-slate-300 h-8"></div></div>)}</div>)}
              {Part('p10', 'Summary', 'PART 10', <div><div className="leading-loose text-lg mb-8" {...editProps}>{data.summary?.text}</div><div className="border-2 border-dashed border-slate-300 p-4 rounded text-center"><span className="font-bold bg-slate-800 text-white px-2 py-1 text-xs rounded mr-2">KEYWORDS</span><span {...editProps}>{!isStudentMode ? (Array.isArray(data.summary?.keywords) ? data.summary.keywords.join(', ') : '') : ''}</span></div></div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
