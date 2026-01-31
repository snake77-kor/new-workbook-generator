import React, { useState, useRef } from 'react';

// -----------------------------------------------------------------------------
// 1. 스타일 정의 (New Design System + A4 Full Optimization)
// -----------------------------------------------------------------------------
const STYLES = `
@page { size: A4; margin: 10mm; }
@media print { 
  .no-print { display: none !important; } 
  .page-break { page-break-after: always; }
  .page-break-before { page-break-before: always; }
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

/* Answer Key Styles */
.answer-key-section { margin-top: 50px; }
.answer-title { font-size: 20px; font-weight: 900; color: #1e293b; margin-bottom: 16px; margin-top: 40px; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #1e293b; padding-bottom: 8px; }
.answer-subtitle { font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 10px; margin-top: 20px; }
.answer-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; }
.answer-table th { background: #f1f5f9; color: #475569; font-weight: 700; padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 12px; text-align: left; }
.answer-table td { padding: 8px 12px; border: 1px solid #e2e8f0; color: #334155; font-size: 12px; vertical-align: top; }
.answer-list { list-style: none; padding: 0; margin: 0; }
.answer-list li { margin-bottom: 4px; display: flex; gap: 8px; font-size: 12px; }
.ans-num { font-weight: 800; color: #2563eb; width: 20px; display: inline-block; }
.ans-val { color: #1e293b; font-weight: 600; }
`;


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const PARTS_LIST = [
  { id: 'p0', label: '어휘' }, { id: 'p1', label: '한글해석' }, { id: 'p3', label: '글의 순서' },
  { id: 'p4', label: '어법 고치기' }, { id: 'p5', label: '빈칸채우기' }, { id: 'p6', label: '내용 일치/불일치' },
  { id: 'p8', label: '단어배열 영작' }, { id: 'p9', label: '조건 영작' }, { id: 'p7', label: '통문장 영작' },
  { id: 'p2', label: '중요문장 영작' }, { id: 'p10', label: '요약문 빈칸' }
];

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
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const [failedPassages, setFailedPassages] = useState<Set<number>>(new Set());
  const [failureReasons, setFailureReasons] = useState<Record<number, string>>({});

  const printRef = useRef<HTMLDivElement>(null);
  const editProps = { contentEditable: true, suppressContentEditableWarning: true };

  const handleKeyChange = (e: any) => {
    setApiKey(e.target.value);
    localStorage.setItem('top_english_key', e.target.value);
  };

  const togglePart = (id: string) => {
    const newSet = new Set(selectedParts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedParts(newSet);
  };

  const handleDownloadHTML = () => {
    if (!printRef.current) return;
    const contentHTML = printRef.current.innerHTML;
    const fullHTML = `< !DOCTYPE html > <html lang="ko"><head><meta charset="UTF-8"><title>Workbook</title><script src="https://cdn.tailwindcss.com"></script><style>${STYLES}</style></head><body>${contentHTML}</body></html>`;
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
    const base = `Act as an English Workbook Generator.Analyze this text: "${text}".You MUST return a valid JSON object.`;
    switch (partId) {
      case 'p0': return `${base} Task: Extract 12 advanced words with synonyms / antonyms.Also find 2 pairs of confusable words.IMPORTANT: Meanings(mean, m1, m2) MUST be in KOREAN.Schema: { "vocabulary": [{ "word": "...", "mean": "...", "syn": "...", "ant": "..." }], "confusable": [{ "w1": "...", "m1": "...", "w2": "...", "m2": "..." }] } `;
      case 'p1': return `${base} Task: Translate sentence by sentence.Schema: { "translation": [{ "en": "...", "ko": "..." }] } `;
      case 'p2': return `${base} Task: IMPORTANT SENTENCE WRITING (Supreme). 1. Identify 5-7 "Key Sentences" based on High-Frequency Syntax (Inversion, Participles, Relatives, Subjunctive, Topic). 2. Provide: - "ko": Accurate Korean interpretation. - "en": Original English sentence. - "clue": Specific WRITING CONDITION (e.g. "Use participle construction", "Start with 'Never'", "Change 'study' to 'studying'"). - "point": The grammar principle used (e.g. "Inversion due to negative adverb"). Schema: { "keySentences": [{ "ko": "...", "en": "...", "clue": "...", "point": "..." }] } `;
      case 'p3': return `${base} Task: Create an ordering problem. 1. Identify the first sentence. 2. Scramble the REST of the sentences. 3. Provide the correct order of the scrambled parts(e.g.B - A - C).Schema: { "ordering": { "firstSentence": "...", "scrambledSentences": ["...", "...", "..."], "answerOrder": "..." } } `;
      case 'p4': return `${base} Task: Grammar Correction (Supreme High-Level CSAT/GPA Style). 1. Generate "incorrectParagraph": Include the ENTIRE original text. Mark exactly 8 grammatical points. FORMAT: Put the circled number BEFORE the underline (e.g. ① <u>word</u>). RULES: - Randomly distribute 4 to 5 INCORRECT points (high-difficulty traps) and 3 to 4 CORRECT distractors. - STRICTLY JOIN THE 'GOLDEN RATIO' of 8 points: [3 pts: Verbs (Subject-Verb/Verbals/Voice)], [2 pts: Connectors (Relatives/Conj vs Prep)], [2 pts: Structure (Parallel/Adj vs Adv)], [1 pt: Special (Inversion/It-that/Complex)]. - VARY Underline Scope: 4-5 items (Word level), 2-3 items (Phrase level), 1 item (Clause level). - NO TYPOS. - "Reason" must be a logical deduction using professional terms (e.g. "주어가 복수형 A이므로 동사도 복수형"). Schema: { "grammar": { "incorrectParagraph": "<p>...Full text...</p>", "corrections": [{ "num": 1, "word": "...", "correct": "...", "reason": "..." }] } }`;
      case 'p5': return `${base} Task: VERBALS/IDIOMS & LOGIC BLANKS (Supreme 4:4:2). 1. Analyze text to identify 12-15 items. - RATIO: 40% Word (Keywords), 40% Phrase (Verbals: Infinitives/Gerunds/Participles, Idioms: Phrasal verbs/Correlatives), 20% Clause. - LOGIC: Connectors (However/Therefore) -> Square Brackets [ (N) ]. - CONTENT: Replace with blanks. Format: (N) ______ (Word), (N) ______________ (Phrase), (N) ____________________________ (Clause). STRICTLY SEQUENTIAL NUMBERS (1), (2)... NO HINTS. 2. answers: Array of objects. "synonyms": Provide context-relevant synonyms (esp. for idioms). Schema: { "blanks": { "text": "...", "answers": [{ "id": 1, "answer": "...", "synonyms": "..." }] } }`;
      case 'p6': return `${base} Task: DYNAMIC ENGLISH INFERENCE T/F & MULTIPLE CHOICE (Supreme). 1. Analyze text length/density. AUTO-DETERMINE quantity (5-10 items): 1 item per 2-3 sentences. Short text=5, Long text=up to 10. 2. Generate "summaryBridge": A 2-3 sentence KOREAN summary of the flow with blanks. 3. Generate "tf": English statements using PARAPHRASING. Include Evidence mapping. 4. Generate "multipleChoice": One 5-choice Objective Question summarizing the T/F points. Schema: { "tf_set": { "summaryBridge": "...", "tf": [{ "q": "...", "a": boolean, "correction": "...", "evidence": "..." }], "multipleChoice": { "q": "...", "choices": ["..."], "a": 1 } } } `;
      case 'p7': return `${base} Task: FULL TEXT WRITING PRACTICE. 1. Analyze the ENTIRE text. 2. Provide ALL sentences for "white paper" writing practice. Schema: { "fullTranslation": [{ "ko": "...", "en": "..." }] } `;
      case 'p8': return `${base} Task: WORD ORDERING WRITING (ALL SENTENCES). 1. Analyze the ENTIRE text sentence by sentence. 2. For EVERY sentence, provide: - "ko": Korean Meaning. - "scrambled": Randomly scrambled words MUST be separated by ' / ' (e.g. "word1 / word2 / word3"). - "original": Correct sentence. - "clue": Condition (e.g. "Add 1 word") or "" if none. - "syntax": Brief structure explanation. Schema: { "arrangement": [{ "ko": "...", "scrambled": "word1 / word2 / ...", "original": "...", "clue": "...", "syntax": "..." }] } `;
      case 'p9': return `${base} Task: GUIDED WRITING (Condition). 1. Select 3-5 challenging sentences. 2. Provide: - "ko": Korean Meaning. - "words": A list of 3-5 key English words from the sentence to be used as hints. - "en": Original English sentence. Schema: { "guided": [{ "ko": "...", "words": ["word1", "word2"], "en": "..." }] } `;
      case 'p10': return `${base} Task: ADVANCED SUMMARY (Paraphrasing). 1. Generate a 1-2 sentence high-level English summary. 2. Create 2-3 blanks labeled (A), (B) for KEYWORDS. 3. TARGET: The answer MUST be a PARAPHRASED word (synonym) or modified form, NOT the exact word from the text if possible. 4. Provide "origin" (word in text) and "synonyms" (list). Schema: { "summary10": { "text": "Summary text with (A) and (B)...", "blanks": [{ "code": "(A)", "correct": "...", "origin": "...", "synonyms": "..." }] } } `;
      default: return `${base} Task: Create ALL parts.Schema: { "vocabulary":..., "translation":..., "keySentences":..., "ordering":..., "grammar":..., "blanks":..., "tf":..., "fullTranslation":..., "arrangement":..., "guided":..., "summary":... } `;
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

    setIsLoading(true); setLoadingPart(partId); setViewPart(partId);
    setFailedPassages(new Set());
    setFailureReasons({});

    // Define the sequence of parts to generate
    const tasks = partId === 'all'
      ? ['p0', 'p1', 'p3', 'p4', 'p5', 'p6', 'p8', 'p9', 'p7', 'p2', 'p10']
      : [partId];

    // Calculate total operations for progress bar
    const totalOps = targets.length * tasks.length;
    setProgress({ current: 0, total: totalOps });

    try {
      const modelName = await discoverModel(cleanKey);
      let opIndex = 0;

      for (const pid of tasks) {
        for (let i = 0; i < targets.length; i++) {
          const p = targets[i];
          opIndex++;
          setProgress({ current: opIndex, total: totalOps });

          const partNameMap: Record<string, string> = {
            p0: '어휘', p1: '해석', p2: '중요문장', p3: '순서', p4: '어법', p5: '빈칸',
            p6: '일치', p7: '통문장', p8: '배열', p9: '조건', p10: '요약'
          };
          const pLabel = partNameMap[pid] || pid;
          setStatusMsg(`🚀 [${opIndex}/${totalOps}] ${modelName} : ${pLabel} 생성 중...`);

          try {
            const data = await fetchWithRetry(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: getPrompt(pid, p.content) }] }],
                  generationConfig: { responseMimeType: "application/json" }
                })
              }
            );

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('No generated text found.');

            let newData;
            try {
              newData = JSON.parse(text);
            } catch (e) {
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
            console.error(`Generate Error (${pid})`, innerErr);
            // If it's a single part request, mark as failed. If 'all', just log and continue (partial success).
            if (tasks.length === 1) {
              setFailedPassages(prev => new Set(prev).add(p.id));
              setFailureReasons(prev => ({ ...prev, [p.id]: innerErr.message || "Unknown error" }));
            }
          }

          // Delay to help avoid 429 errors (Rate Limit)
          if (opIndex < totalOps) {
            await delay(1200);
          }
        }
      }
      setStatusMsg("✅ 완료!"); setTimeout(() => setStatusMsg(null), 4000);
    } catch (e: any) { setErrorMsg(e.message); } finally { setIsLoading(false); setLoadingPart(null); setProgress({ current: 0, total: 0 }); }
  };



  const renderWorkbookCard = (passageName: string, partName: string, step: string, contentNode: React.ReactNode) => (
    <div className="exam-wrapper p-10 mb-12 page-break">
      <div className="main-title-bar"><span className="main-title-text">Top English Workbook Pro</span><span className="text-xs opacity-80">High School English</span></div>
      <div className="question-header">
        <div className="question-badge">{passageName.replace(/[^0-9]/g, '') || 'Q'}</div>
        <div className="part-title-ribbon"><span className="step-label">{step}</span><span className="part-name">{partName}</span></div>
      </div>
      <div className="passage-box">
        {contentNode}
      </div>
    </div>
  );

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

          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            <button
              onClick={() => handleGenerate(selectedParts.size > 0 ? 'selected' : 'all')}
              className="sidebar-btn gen-all-btn mb-4 w-full"
              style={{ minHeight: '56px', whiteSpace: 'nowrap', justifyContent: 'center' }}
            >
              {isLoading && (loadingPart === 'all' || loadingPart === 'selected')
                ? <><span className="animate-spin mr-2 flex-shrink-0">⌛</span>생성 중...</>
                : (selectedParts.size > 0 ? `⚡ 선택 항목 생성 (${selectedParts.size})` : "⚡ 전체 워크북 생성")
              }
            </button>
            {PARTS_LIST.map((item, i) => (
              <div key={i} className="flex gap-2 items-center mb-1">
                <div className="h-full flex items-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                    checked={selectedParts.has(item.id)}
                    onChange={() => togglePart(item.id)}
                  />
                </div>
                <button onClick={() => handleGenerate(item.id)} className={`sidebar-btn flex-1 mb-0 justify-between ${viewPart === item.id ? 'active' : ''}`}>
                  <span>Part {i + 1}. {item.label}</span>
                </button>
              </div>
            ))}
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
            summary10: ensureObject(rawData.summary10),
          };
          const name = wb.passageName;
          const isFailed = failedPassages.has(p.id);

          const isTarget = (k: string) => (viewPart === 'all' || viewPart === k);
          const hasData = (d: any) => (d && (Array.isArray(d) ? d.length > 0 : Object.keys(d).length > 0));

          const Part = (key: string, title: string, step: string, content: React.ReactNode, _unused?: any) => {
            if (!isTarget(key)) return null;
            const map: any = {
              p0: 'vocabulary', p1: 'translation', p2: 'keySentences', p3: 'ordering',
              p4: 'grammar', p5: 'blanks', p6: 'tf', p7: 'fullTranslation',
              p8: 'arrangement', p9: 'guided', p10: 'summary10'
            };
            const dataKey = map[key];
            const realData = data[dataKey];

            // Render FRAME first, then content or loading. 
            // This prevents "white screen" because the component structure always exists.
            let inner = content;
            if (!hasData(realData)) {
              if (isFailed) {
                inner = <div className="error-box">생성 실패: {failureReasons[p.id] || "잠시 후 다시 시도해주세요."}</div>
              } else {
                // Keep the structure but show loading text
                inner = (
                  <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-slate-400">
                    <div className="animate-spin text-2xl mb-2">⌛</div>
                    <div className="font-bold text-center px-4">
                      {key === 'p4'
                        ? "수능/내신 빈출 포인트를 3:2:2:1 비율로 배분하여\n고난도 어법 문제를 생성 중입니다..."
                        : key === 'p2'
                          ? "내신/수능 빈출 구문 선정 기준에 따라\n중요문장을 분석하여 영작 워크북을 생성 중입니다..."
                          : key === 'p5'
                            ? "준동사와 숙어를 중심으로 4:4:2 황금 비율의\n고난도 빈칸채우기 문제를 생성 중입니다..."
                            : key === 'p6'
                              ? "지문의 길이를 분석하여 최적의 정보 밀도로\n실전형 일치/불일치 문제를 생성 중입니다..."
                              : key === 'p7'
                                ? "지문 전체를 분석하여\n통문장 영작(백지 복습)을 생성 중입니다..."
                                : key === 'p8'
                                  ? "지문 전체 문장의 구조를 분석하여\n어순 배열영작 문제를 생성 중입니다..."
                                  : key === 'p9'
                                    ? "주요 어휘를 활용한\n조건 영작 문제를 생성 중입니다..."
                                    : key === 'p10'
                                      ? "부산 지역 내신 서술형의\n요약문 변형 패턴을 분석하여 문제를 생성 중입니다..."
                                      : "AI가 문제를 생성하고 있습니다..."}
                    </div>
                  </div>
                );
              }
            }

            return renderWorkbookCard(name, title, step, inner);
          };

          return (
            <div key={p.id}>
              {Part('p0', '어휘', 'PART 01',
                <div>
                  <table className="vocab-table">
                    <thead><tr><th style={{ width: '25%' }}>Word</th><th style={{ width: '25%' }}>Meaning</th><th style={{ width: '25%' }}>Synonym</th><th style={{ width: '25%' }}>Antonym</th></tr></thead>
                    <tbody>
                      {Array.isArray(data.vocabulary) && data.vocabulary.map((v: any, k: number) => (
                        <tr key={k}>
                          <td><div className="vocab-word" {...editProps}>{v?.word}</div></td>
                          <td><div className="vocab-mean" {...editProps}></div></td>
                          <td><div className="vocab-meta" {...editProps}></div></td>
                          <td><div className="vocab-meta" {...editProps}></div></td>
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
                            <div><span className="confusable-word">{c?.w1}</span> <span className="text-sm text-slate-600"></span></div>
                            <div className="text-slate-400 font-bold text-xs mx-4">VS</div>
                            <div className="text-right"><span className="confusable-word">{c?.w2}</span> <span className="text-sm text-slate-600"></span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {Part('p1', '한글해석', 'PART 02', <div className="space-y-6">{Array.isArray(data.translation) && data.translation.map((s: any, k: number) => <div key={k}><div className="font-medium leading-relaxed mb-3" {...editProps}><span className="text-blue-600 font-bold mr-2">{k + 1}.</span>{s?.en}</div><div className="pl-6 border-b border-slate-300 h-8 mb-2"></div></div>)}</div>, false)}
              {Part('p3', '글의 순서', 'PART 03', <div><div className="ordering-box" {...editProps}>{data.ordering?.firstSentence}</div><div className="space-y-4 mb-8">{Array.isArray(data.ordering?.scrambledSentences) && data.ordering?.scrambledSentences.map((s: string, k: number) => <div key={k} className="flex gap-3"><div className="font-bold text-blue-600 text-lg flex-shrink-0">{['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][k] || (k + 1)}</div><div className="leading-relaxed" {...editProps}>{s}</div></div>)}</div><div className="border-t-2 border-slate-200 pt-4 flex items-end gap-2"><span className="font-bold text-slate-700">Answer:</span><div className="border-b-2 border-slate-300 w-48"></div></div></div>, false)}
              {Part('p4', '어법 고치기', 'PART 04',
                <div>
                  <div className="passage-box mb-8" style={{ minHeight: '150px', lineHeight: '2.2' }}>
                    {data.grammar?.incorrectParagraph
                      ? <div dangerouslySetInnerHTML={{ __html: data.grammar.incorrectParagraph }} {...editProps} />
                      : <div className="h-full flex items-center justify-center text-slate-400 italic text-center">수능/내신 빈출 포인트를 3:2:2:1 비율로 배분하여<br />고난도 어법 문제를 생성 중입니다...</div>
                    }
                  </div>
                  <table className="vocab-table">
                    <thead>
                      <tr>
                        <th style={{ width: '10%' }}>번호</th>
                        <th style={{ width: '30%' }}>틀린 표현</th>
                        <th style={{ width: '30%' }}>바른 표현</th>
                        <th style={{ width: '30%' }}>이유</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(data.grammar?.corrections) && data.grammar.corrections.map((c: any, k: number) => (
                        <tr key={k}>
                          <td className="font-bold text-center text-blue-600">{c?.num ? (['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][c.num - 1] || c.num) : (k + 1)}</td>
                          <td className="font-bold h-10 align-middle border-b border-slate-100" {...editProps}></td>
                          <td className="text-blue-600 font-bold h-10 align-middle border-b border-slate-100" {...editProps}></td>
                          <td className="text-xs text-slate-500 h-10 align-middle border-b border-slate-100" {...editProps}></td>
                        </tr>
                      ))}
                      {(!data.grammar?.corrections || data.grammar.corrections.length === 0) && [1, 2, 3, 4, 5, 6, 7, 8].map(i => <tr key={i}><td className="font-bold text-center text-blue-600">{['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][i - 1]}</td><td></td><td></td><td></td></tr>)}
                    </tbody>
                  </table>
                </div>
                , false)}
              {Part('p5', '빈칸채우기', 'PART 05', <div className="leading-loose text-justify" {...editProps} dangerouslySetInnerHTML={{ __html: (data.blanks?.text || '').replace(/\n/g, '<br/>').replace(/\((\d+)\)\s*(_+)/g, '<span class="whitespace-nowrap">($1) $2</span>').replace(/\[\s*\((\d+)\)\s*\]/g, '<span class="whitespace-nowrap">[ ($1) ]</span>') }} />, data.blanks?.ko)}
              {Part('p6', '내용 일치/불일치', 'PART 06',
                <div>
                  {data.tf_set?.summaryBridge && <div className="bg-slate-50 p-4 rounded mb-6 text-sm leading-relaxed border border-slate-200" {...editProps}><span className="font-bold text-blue-600 mb-1 block">[글의 흐름 정리]</span>{data.tf_set.summaryBridge}</div>}
                  <div className="space-y-8">
                    {Array.isArray(data.tf_set?.tf) && data.tf_set.tf.map((q: any, k: number) => (
                      <div key={k} className="border-b border-slate-200 pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold mr-2 text-slate-700">Q{k + 1}.</span>
                          <span className="leading-relaxed flex-1 text-justify" {...editProps}>{q?.q}</span>
                          <span className="font-bold font-mono ml-4 text-slate-400 whitespace-nowrap">( T / F )</span>
                        </div>
                        <div className="flex gap-4 mt-2 items-center">
                          <div className="flex-1 text-xs text-slate-400 border-b border-dashed border-slate-300 pb-1">Evidence: </div>
                        </div>
                        <div className="text-sm text-slate-500 mt-2 border-b border-dashed border-slate-300 pb-1">If False, correct it: </div>
                      </div>
                    ))}
                  </div>
                  {data.tf_set?.multipleChoice && (
                    <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-lg page-break-inside-avoid">
                      <div className="font-bold mb-4">Final Check. {data.tf_set.multipleChoice.q}</div>
                      <div className="space-y-2">
                        {data.tf_set.multipleChoice.choices.map((c: string, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <span className="font-bold text-slate-500">{idx + 1}.</span>
                            <span {...editProps}>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>, false)}
              {Part('p8', '단어배열 영작', 'PART 07', <div className="space-y-12">{Array.isArray(data.arrangement) && data.arrangement.map((s: any, k: number) => <div key={k}><div className="flex items-start mb-2"><span className="font-bold text-blue-600 mr-2 mt-1">{k + 1}.</span><div className="font-bold text-lg leading-relaxed text-slate-800" {...editProps}>{s?.ko}</div></div>{s?.clue && <div className="text-xs font-bold text-blue-500 mb-2 ml-6">Tip: <span {...editProps}>{s.clue}</span></div>}<div className="ml-6 mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm leading-loose text-slate-600 font-medium tracking-wide" {...editProps}>{s?.scrambled}</div><div className="ml-6 border-b border-slate-300 h-8"></div></div>)}</div>, false)}
              {Part('p9', '조건 영작', 'PART 08', <div className="space-y-12">{Array.isArray(data.guided) && data.guided.map((s: any, k: number) => <div key={k}><div className="flex items-start mb-2"><span className="font-bold text-blue-600 mr-2 mt-1">{k + 1}.</span><div className="font-bold text-lg leading-relaxed text-slate-800" {...editProps}>{s?.ko}</div></div><div className="text-sm rounded mb-4 ml-6" {...editProps}><span className="font-bold text-blue-600 mr-2">Hint:</span>{Array.isArray(s?.words) ? s.words.join(', ') : s?.words}</div><div className="ml-6 border-b border-slate-300 h-8"></div></div>)}</div>, false)}
              {Part('p7', '통문장 영작', 'PART 09', <div className="space-y-12">{Array.isArray(data.fullTranslation) && data.fullTranslation.map((s: any, k: number) => <div key={k}><div className="flex items-start mb-2"><span className="font-bold text-blue-600 mr-2 mt-1">{k + 1}.</span><div className="font-bold text-lg leading-relaxed text-slate-800" {...editProps}>{s?.ko}</div></div><div className="ml-6 border-b border-slate-300 h-8"></div></div>)}</div>, false)}
              {Part('p2', '중요문장 영작', 'PART 10', <div className="space-y-12">{Array.isArray(data.keySentences) && data.keySentences.map((s: any, k: number) => <div key={k}><div className="flex items-start mb-2"><span className="font-bold text-blue-600 mr-2 mt-1">{k + 1}.</span><div className="font-bold text-lg leading-relaxed text-slate-800" {...editProps}>{s?.ko}</div></div><div className="mb-4 ml-6 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 font-bold"><span className="text-blue-600 mr-2">[조건]</span><span {...editProps}>{s?.clue || '문맥에 맞게 영작하시오.'}</span></div><div className="ml-6 space-y-4"><div className="border-b border-slate-300 h-8"></div><div className="border-b border-slate-300 h-8"></div></div></div>)}</div>, false)}
              {Part('p10', '요약문 빈칸', 'PART 11',
                <div>
                  <div
                    className="passage-box mb-6 leading-loose text-lg text-justify"
                    {...editProps}
                    dangerouslySetInnerHTML={{
                      __html: (data.summary10?.text || '')
                        .replace(/\(A\)/g, '<span class="inline-block whitespace-nowrap"><span class="font-bold mr-1">(A)</span><span class="inline-block border-b-2 border-slate-800 w-[80px] mx-1 mb-[-4px]"></span></span>')
                        .replace(/\(B\)/g, '<span class="inline-block whitespace-nowrap"><span class="font-bold mr-1">(B)</span><span class="inline-block border-b-2 border-slate-800 w-[80px] mx-1 mb-[-4px]"></span></span>')
                    }}
                  />
                  <div className="text-sm font-bold text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">[조건: 본문의 단어를 활용하되 필요 시 어형 변화, 유의어 사용 권장]</div>
                </div>,
                false
              )}
            </div>
          );
        })}


        {/* --- ANSWER KEY SECTION --- */}
        <section className="answer-key-section page-break-before mb-20">
          <div className="flex items-center justify-center mb-16 pt-12">
            <div className="text-center">
              <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">ANSWER KEY</h2>
              <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
            </div>
          </div>

          {passages.map((p, pIdx) => {
            const wb = workbooks[p.id] || { data: {} };
            const data = wb.data || {};
            const pName = wb.passageName || p.name || `Passage ${pIdx + 1}`;

            // Should we show this passage?
            const hasAnyData = Object.keys(data).length > 0;
            if (!hasAnyData) return null;

            // Helper to check view
            const isTarget = (k: string) => (viewPart === 'all' || viewPart === k);

            return (
              <div key={p.id} className="mb-12 break-inside-avoid">
                <h3 className="answer-title">{pName} <span className="text-sm font-normal text-slate-500 ml-2"> 정답 및 해설</span></h3>

                <div className="grid grid-cols-1 gap-6">

                  {/* Part 0: Vocab */}
                  {isTarget('p0') && data.vocabulary?.length > 0 && (
                    <div>
                      <h4 className="answer-subtitle">Part 0. Vocabulary</h4>
                      <table className="answer-table">
                        <thead><tr><th>Word</th><th>Meaning</th></tr></thead>
                        <tbody>
                          {data.vocabulary.slice(0, 12).map((v: any, i: number) => (
                            <tr key={i}><td className="font-bold">{v.word}</td><td>{v.mean}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Part 2: Key Sentences */}
                  {isTarget('p2') && data.keySentences?.length > 0 && (
                    <div>
                      <h4 className="answer-subtitle">Part 2. 중요문장 영작</h4>
                      <table className="answer-table">
                        <thead>
                          <tr>
                            <th className="w-16 text-center" style={{ backgroundColor: '#1e40af', color: 'white' }}>No.</th>
                            <th style={{ backgroundColor: '#1e40af', color: 'white' }}>Correct Sentence</th>
                            <th className="w-1/3" style={{ backgroundColor: '#1e40af', color: 'white' }}>Grammar Point</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.keySentences.map((s: any, i: number) => (
                            <tr key={i}>
                              <td className="text-center font-bold text-blue-600 border-r">{i + 1}</td>
                              <td className="font-medium text-slate-800 border-r leading-relaxed">{s.en}</td>
                              <td className="text-sm text-slate-500 italic">{s.point || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Part 3: Ordering */}
                  {isTarget('p3') && data.ordering && (
                    <div>
                      <h4 className="answer-subtitle">Part 3. Ordering</h4>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-sm">
                        <span className="font-bold text-blue-600">Answer:</span> {data.ordering.answerOrder || "See original text logic"}
                      </div>
                    </div>
                  )}

                  {/* Part 4: Grammar */}
                  {isTarget('p4') && (
                    <div>
                      <h4 className="answer-subtitle">Part 4. Grammar Correction</h4>
                      {data.grammar?.corrections?.length > 0 ? (
                        <table className="answer-table animate-fade-in">
                          <thead>
                            <tr>
                              <th className="w-16 text-center" style={{ backgroundColor: '#1e40af', color: 'white' }}>No.</th>
                              <th className="w-1/3" style={{ backgroundColor: '#1e40af', color: 'white' }}>Correction</th>
                              <th style={{ backgroundColor: '#1e40af', color: 'white' }}>Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.grammar.corrections.map((c: any, i: number) => (
                              <tr key={i}>
                                <td className="text-center font-bold text-blue-600 border-r">{['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][c.num - 1] || c.num}</td>
                                <td className="font-bold text-blue-600 border-r">{c.correct}</td>
                                <td className="text-slate-600 text-xs leading-relaxed">{c.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-500">
                          수능 빈출 어법을 분석하여 정답지를 구성 중입니다...
                        </div>
                      )}
                    </div>
                  )}


                  {/* Part 5: Blanks */}
                  {isTarget('p5') && (data.blanks?.answers || data.blanks?.ko) && (
                    <div>
                      <h4 className="answer-subtitle">Part 5. 빈칸채우기</h4>
                      {data.blanks.answers ? (
                        <table className="answer-table">
                          <thead>
                            <tr>
                              <th className="w-16 text-center" style={{ backgroundColor: '#1e40af', color: 'white' }}>No.</th>
                              <th style={{ backgroundColor: '#1e40af', color: 'white' }}>Answer (Words / Chunks)</th>
                              <th className="w-1/3" style={{ backgroundColor: '#1e40af', color: 'white' }}>Synonyms (유의어)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.blanks.answers.map((ans: any, i: number) => {
                              // Handle both object (new) and string (legacy) formats
                              const answerText = typeof ans === 'string' ? ans : ans.answer;
                              const synonymText = typeof ans === 'string' ? '-' : ans.synonyms;
                              const numText = (ans.id || i + 1);
                              return (
                                <tr key={i}>
                                  <td className="text-center font-bold text-blue-600 border-r">{numText}</td>
                                  <td className="font-bold text-slate-800 border-r">{answerText}</td>
                                  <td className="text-slate-500 text-sm italic">{synonymText}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-xs text-slate-400 italic">정답 데이터가 없습니다. (재생성 필요)</div>
                      )}
                    </div>
                  )}

                  {/* Part 6: T/F Set */}
                  {isTarget('p6') && data.tf_set?.tf?.length > 0 && (
                    <div>
                      <h4 className="answer-subtitle">Part 6. 내용 일치/불일치</h4>
                      <table className="answer-table animate-fade-in mb-6">
                        <thead>
                          <tr>
                            <th className="w-16 text-center" style={{ backgroundColor: '#1e40af', color: 'white' }}>No.</th>
                            <th className="w-20 text-center" style={{ backgroundColor: '#1e40af', color: 'white' }}>Answer</th>
                            <th style={{ backgroundColor: '#1e40af', color: 'white' }}>Correction / Evidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.tf_set.tf.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="text-center font-bold text-blue-600 border-r">Q{i + 1}</td>
                              <td className={`text-center font-bold border-r ${item.a ? 'text-blue-600' : 'text-red-500'}`}>{item.a ? 'True' : 'False'}</td>
                              <td className="text-slate-600 text-sm leading-relaxed">
                                {item.correction && <div className="mb-1"><strong>Correction:</strong> {item.correction}</div>}
                                {item.evidence && <div className="text-xs text-slate-400">Evidence: {item.evidence}</div>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {data.tf_set.multipleChoice && (
                        <div className="bg-slate-100 p-4 rounded text-sm">
                          <strong>Final Check Answer: </strong> <span className="text-blue-600 font-bold">{data.tf_set.multipleChoice.a}</span>
                        </div>
                      )}
                    </div>
                  )}




                  {/* Part 7: Arrangement (p8) -> Displayed as Part 7 */}
                  {isTarget('p8') && data.arrangement?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="answer-subtitle">Part 7. 단어배열 영작</h4>
                      <table className="answer-table">
                        <thead>
                          <tr>
                            <th className="w-16 text-center" style={{ backgroundColor: '#1e40af', color: 'white' }}>No.</th>
                            <th style={{ backgroundColor: '#1e40af', color: 'white' }}>Correct Sentence</th>
                            <th className="w-1/4" style={{ backgroundColor: '#1e40af', color: 'white' }}>Syntax Principle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.arrangement.map((s: any, i: number) => (
                            <tr key={i}>
                              <td className="text-center font-bold text-blue-600 border-r">{i + 1}</td>
                              <td className="font-medium text-slate-800 border-r leading-relaxed">{s.original}</td>
                              <td className="text-sm text-slate-500 italic">{s.syntax || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Part 8: Guided Writing (p9) -> Displayed as Part 8 */}
                  {isTarget('p9') && data.guided?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="answer-subtitle">Part 8. 조건 영작</h4>
                      <ul className="answer-list">
                        {data.guided.map((s: any, i: number) => (
                          <li key={i}><span className="ans-num">{i + 1}.</span> <span className="ans-val">{s.en}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Part 9: Full Translation (p7) -> Displayed as Part 9 */}
                  {isTarget('p7') && data.fullTranslation?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="answer-subtitle">Part 9. 통문장 영작</h4>
                      <ul className="answer-list">
                        {data.fullTranslation.map((s: any, i: number) => (
                          <li key={i}><span className="ans-num">{i + 1}.</span> <span className="ans-val">{s.en}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Part 10: Key Sentences (p2) -> Displayed as Part 10 */}
                  {isTarget('p2') && data.keySentences?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="answer-subtitle">Part 10. 중요문장 영작</h4>
                      <table className="answer-table">
                        <thead>
                          <tr>
                            <th className="w-16 text-center" style={{ backgroundColor: '#1e40af', color: 'white' }}>No.</th>
                            <th style={{ backgroundColor: '#1e40af', color: 'white' }}>Correct Sentence</th>
                            <th className="w-1/3" style={{ backgroundColor: '#1e40af', color: 'white' }}>Grammar Point</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.keySentences.map((s: any, i: number) => (
                            <tr key={i}>
                              <td className="text-center font-bold text-blue-600 border-r">{i + 1}</td>
                              <td className="font-medium text-slate-800 border-r leading-relaxed">{s.en}</td>
                              <td className="text-sm text-slate-500 italic">{s.point || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Part 11: Summary10 (p10) -> Displayed as Part 11 */}
                  {isTarget('p10') && data.summary10?.blanks?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="answer-subtitle">Part 11. 요약문 빈칸</h4>
                      <table className="answer-table">
                        <thead>
                          <tr>
                            <th className="w-16 text-center" style={{ backgroundColor: '#1e40af', color: 'white' }}>Code</th>
                            <th style={{ backgroundColor: '#1e40af', color: 'white' }}>Answer (Paraphrased)</th>
                            <th style={{ backgroundColor: '#1e40af', color: 'white' }}>Origin Text</th>
                            <th style={{ backgroundColor: '#1e40af', color: 'white' }}>Synonyms</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.summary10.blanks.map((b: any, i: number) => (
                            <tr key={i}>
                              <td className="text-center font-bold text-blue-600 border-r">{b.code}</td>
                              <td className="font-bold text-slate-800 border-r">{b.correct}</td>
                              <td className="text-slate-500 border-r">{b.origin}</td>
                              <td className="text-sm text-slate-600 italic">{b.synonyms}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
                <div className="border-b-2 border-dashed border-slate-200 mt-8"></div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}





