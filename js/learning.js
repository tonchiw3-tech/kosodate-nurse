const learningArticles = [
  { title: '認知症の人への対応とケア', category: '認知症', description: '認知症の人の尊厳を守りながら、安心につながる関わり方を学べます。', source: '厚生労働省', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000076236.html' },
  { title: '糖尿病の基礎知識', category: '糖尿病', description: '糖尿病の症状や治療、日常生活での注意点を確認できます。', source: '国立国際医療研究センター', url: 'https://dmic.ncgm.go.jp/general/about-dm/010/010/01.html' },
  { title: '褥瘡の予防とケア', category: '褥瘡', description: '褥瘡の発生要因と、観察・体位変換など予防の基本を紹介します。', source: '日本褥瘡学会', url: 'https://www.jspu.org/general/' },
  { title: '標準予防策と感染対策', category: '感染対策', description: 'すべての患者さんに適用する標準予防策の考え方を学べます。', source: '国立感染症研究所', url: 'https://www.niid.go.jp/niid/ja/' },
  { title: '採血を受ける方へのご案内', category: '採血', description: '採血前後の注意点や、検査を安全に行うための基礎知識です。', source: '日本臨床検査技師会', url: 'https://www.jamt.or.jp/' },
  { title: '転倒・転落予防のために', category: '転倒予防', description: '転倒リスクを確認し、安全な療養環境を整えるポイントを紹介します。', source: '日本看護協会', url: 'https://www.nurse.or.jp/nursing/practice/anzen/' }
];

const CUSTOM_KEYWORDS_KEY = 'kosodateNurseCustomLearningKeywords';

function loadCustomKeywords() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_KEYWORDS_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(keyword => typeof keyword === 'string' && keyword.trim()) : [];
  } catch { return []; }
}

function saveCustomKeywords(keywords) { localStorage.setItem(CUSTOM_KEYWORDS_KEY, JSON.stringify(keywords)); }

function searchLearningArticles(keyword) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return learningArticles;
  return learningArticles.filter(article => [article.title, article.category, article.description].some(value => value.toLowerCase().includes(normalized)));
}

function searchMedicalArticles(keyword) {
  const value = keyword.trim();
  if (!value) return;
  const url = `https://www.google.com/search?q=${encodeURIComponent(`${value} 看護 医療`)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function renderLearningResults(articles, keyword) {
  const results = document.querySelector('#article-results');
  if (!articles.length) {
    results.innerHTML = '<p class="search-empty">該当する記事が見つかりませんでした。別のキーワードで検索してください。</p>';
    return;
  }
  results.innerHTML = articles.map(article => `<article class="article-card"><span class="article-category">${article.category}</span><h2>${article.title}</h2><p class="article-description">${article.description}</p><p class="article-source">情報元：${article.source}</p><a class="button" href="${article.url}" target="_blank" rel="noopener noreferrer">記事を見る</a></article>`).join('');
  if (keyword) results.querySelector('.article-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('#article-search');
  const runSearch = () => searchMedicalArticles(input.value);
  document.querySelector('#search-button')?.addEventListener('click', runSearch);
  input?.addEventListener('keydown', event => { if (event.key === 'Enter') runSearch(); });
  document.querySelectorAll('[data-keyword]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.keyword; input.focus(); }));
  const customKeywords = loadCustomKeywords();
  const customKeywordArea = document.querySelector('#custom-keywords');
  const customKeywordsEmpty = document.querySelector('#custom-keywords-empty');
  const keywordForm = document.querySelector('#keyword-form');
  const keywordInput = document.querySelector('#custom-keyword');
  const keywordMessage = document.querySelector('#keyword-form-message');
  const renderCustomKeywords = () => {
    customKeywordArea.innerHTML = '';
    customKeywordsEmpty.hidden = customKeywords.length > 0;
    customKeywords.forEach(keyword => {
      const wrapper = document.createElement('span'); wrapper.className = 'custom-keyword-item';
      const button = document.createElement('button'); button.type = 'button'; button.textContent = keyword; button.dataset.keyword = keyword;
      button.addEventListener('click', () => { input.value = keyword; input.focus(); });
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-keyword-button'; remove.textContent = '削除'; remove.setAttribute('aria-label', `${keyword}を削除`);
      remove.addEventListener('click', () => { const index = customKeywords.indexOf(keyword); if (index >= 0) customKeywords.splice(index, 1); saveCustomKeywords(customKeywords); renderCustomKeywords(); });
      wrapper.append(button, remove); customKeywordArea.appendChild(wrapper);
    });
  };
  document.querySelector('#show-keyword-form')?.addEventListener('click', () => { keywordForm.hidden = false; keywordInput.focus(); });
  keywordForm?.addEventListener('submit', event => {
    event.preventDefault(); const keyword = keywordInput.value.trim(); keywordMessage.textContent = '';
    if (!keyword) { keywordMessage.textContent = 'キーワードを入力してください。'; keywordInput.focus(); return; }
    if (customKeywords.includes(keyword)) { keywordMessage.textContent = '同じキーワードは登録できません。'; keywordInput.focus(); return; }
    customKeywords.push(keyword); saveCustomKeywords(customKeywords); renderCustomKeywords(); keywordInput.value = ''; keywordMessage.textContent = '追加しました。';
  });
  renderCustomKeywords();
  const today = new Date(); const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const records = JSON.parse(localStorage.getItem('kosodateNurseDailyRecords') || '{}'); const record = records[todayKey];
  const keywords = typeof record === 'object' ? (record.keywords || []) : [];
  const keywordArea = document.querySelector('#recommended-keywords'); const message = document.querySelector('#recommended-message');
  if (keywords.length) keywords.forEach(keyword => { const button = document.createElement('button'); button.type = 'button'; button.textContent = keyword; button.dataset.keyword = keyword; keywordArea.appendChild(button); button.addEventListener('click', () => { input.value = keyword; input.focus(); }); });
  else message.textContent = record ? '学びたいキーワードを入力して検索できます。' : '「今日を残す」で記録すると、学習キーワードが表示されます。';
  renderLearningResults(learningArticles, '');
});
