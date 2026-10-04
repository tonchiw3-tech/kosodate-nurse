document.addEventListener('DOMContentLoaded', () => {
  const key = 'kosodateNurseDailyRecords';
  const today = new Date();
  let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = '';
  let recognition = null;
  let finalTranscript = '';
  const $ = (id) => document.getElementById(id);
  const records = () => JSON.parse(localStorage.getItem(key) || '{}');
  const recordText = (record) => typeof record === 'string' ? record : (record?.text || '');
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const japaneseDate = (value) => { const date = new Date(`${value}T00:00:00`); return `${date.getMonth() + 1}月${date.getDate()}日の記録`; };

  function renderCalendar() {
    const year = displayedMonth.getFullYear(); const month = displayedMonth.getMonth();
    $('calendar-month').textContent = `${year}年${month + 1}月`;
    const grid = $('calendar-grid'); grid.innerHTML = ''; const saved = records();
    const firstDay = new Date(year, month, 1).getDay(); const days = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i += 1) grid.appendChild(document.createElement('span'));
    for (let day = 1; day <= days; day += 1) {
      const date = new Date(year, month, day); const value = dateKey(date); const button = document.createElement('button');
      button.type = 'button'; button.className = 'calendar-day'; button.textContent = day; button.setAttribute('aria-label', `${year}年${month + 1}月${day}日`);
      if (value === dateKey(today)) button.classList.add('is-today');
      if (saved[value]) { button.classList.add('has-record'); button.setAttribute('aria-label', `${button.getAttribute('aria-label')}、記録あり`); const dot = document.createElement('span'); dot.className = 'record-dot'; dot.setAttribute('aria-hidden', 'true'); button.appendChild(dot); }
      button.addEventListener('click', () => openEntry(value)); grid.appendChild(button);
    }
  }
  function openEntry(value) { selectedDate = value; const saved = recordText(records()[value]); $('entry-panel').hidden = false; $('entry-title').textContent = japaneseDate(value); $('record-text').value = saved; $('voice-status').textContent = ''; finalTranscript = saved; $('record-text').focus(); }
  function stopVoice() {
    if (recognition) {
      try { recognition.stop(); } catch (error) { /* すでに停止済みの場合 */ }
    }
    $('start-voice').disabled = false;
    $('stop-voice').disabled = true;
  }
  $('previous-month').addEventListener('click', () => { displayedMonth.setMonth(displayedMonth.getMonth() - 1); renderCalendar(); });
  $('next-month').addEventListener('click', () => { displayedMonth.setMonth(displayedMonth.getMonth() + 1); renderCalendar(); });
  $('save-record').addEventListener('click', () => { const text = $('record-text').value.trim(); if (!text) { $('voice-status').textContent = '文章を入力してから保存してください。'; return; } const saved = records(); saved[selectedDate] = { text, keywords: extractLearningKeywords(text) }; localStorage.setItem(key, JSON.stringify(saved)); $('voice-status').textContent = '保存しました。学習キーワードも記録しました。'; renderCalendar(); });
  $('stop-voice').addEventListener('click', stopVoice);
  $('start-voice').addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      $('voice-status').textContent = '音声入力はHTTPSまたはlocalhostで開いてください。文字入力はそのまま利用できます。';
      return;
    }
    if (!SpeechRecognition) { $('voice-status').textContent = 'このブラウザは音声入力に対応していません。Google ChromeまたはMicrosoft Edgeでお試しください。'; return; }
    if (recognition) recognition.stop(); recognition = new SpeechRecognition(); recognition.lang = 'ja-JP'; recognition.continuous = true; recognition.interimResults = true; finalTranscript = $('record-text').value;
    recognition.onstart = () => { $('voice-status').textContent = '録音中… 話しかけてください。'; $('start-voice').disabled = true; $('stop-voice').disabled = false; };
    recognition.onresult = (event) => { let interim = ''; for (let i = event.resultIndex; i < event.results.length; i += 1) { const text = event.results[i][0].transcript; if (event.results[i].isFinal) finalTranscript += text; else interim += text; } $('record-text').value = finalTranscript + interim; };
    recognition.onerror = (event) => {
      const messages = {
        'not-allowed': 'マイクの使用を許可してください。ブラウザのアドレスバー左側の設定を確認してください。',
        'service-not-allowed': '音声サービスが許可されていません。HTTPSで開き、ブラウザのマイク設定を確認してください。',
        'audio-capture': 'マイクが見つかりません。マイクの接続と他アプリの使用状況を確認してください。',
        'network': '音声サービスに接続できませんでした。インターネット接続を確認してください。',
        'no-speech': '音声を認識できませんでした。マイクに向かってもう一度話してください。'
      };
      $('voice-status').textContent = messages[event.error] || '音声入力を開始できませんでした。文字入力をご利用ください。';
      stopVoice();
    };
    recognition.onend = () => { $('start-voice').disabled = false; $('stop-voice').disabled = true; if ($('voice-status').textContent.startsWith('録音中')) $('voice-status').textContent = '音声入力を停止しました。内容を確認して保存してください。'; };
    try { recognition.start(); } catch (error) { $('voice-status').textContent = '音声入力を開始できませんでした。文字入力をご利用ください。'; stopVoice(); }
  });
  renderCalendar();
});

// AI APIに置き換えやすい、無料デモ用の簡易抽出処理です。
function extractLearningKeywords(text) {
  const supportWords = ['大腸内視鏡', '内視鏡検査', '呼吸状態', '感染対策', '転倒予防', '褥瘡', 'アセスメント', 'バイタルサイン', '酸素療法', '鎮静', '内視鏡', '呼吸', '観察', '採血', '認知症', '糖尿病', '服薬', '発熱', '疼痛', '看護'];
  const stopWords = new Set('今日 今日は こと もの ため ように ような 患者 患者さん さん 自分 私 私たち 担当 担当した 受け持った 思った 感じた 行った した する について もう一度 勉強したい たい です ます でした ました'.split(/\s+/));
  const source = String(text || '').replace(/[、。！？!?,，．\n\r\t]/g, ' ');
  const matches = new Set();
  supportWords.forEach(word => { if (source.includes(word)) matches.add(word); });
  source.split(/\s+/).map(word => word.replace(/^[「『（(]+|[」』）)]+$/g, '').trim()).filter(word => word.length >= 2 && !stopWords.has(word) && !/^[0-9０-９]+$/.test(word)).forEach(word => matches.add(word));
  return [...matches].sort((a, b) => b.length - a.length).filter((word, index, list) => !list.some((longer, i) => i !== index && longer.length > word.length && longer.includes(word))).slice(0, 5);
}
