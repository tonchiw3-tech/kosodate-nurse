const nursingNewsCategories = ['すべて', '研修・セミナー', '制度', '資格・認定', '働き方', '医療安全', '看護技術'];

// デモ用データ。本文の転載はせず、公式サイトへの導線と短い概要だけを保持します。
const nursingNewsData = {
  updatedAt: '2026-10-04T09:00:00+09:00',
  items: [
    { category: '研修・セミナー', title: '看護の学びを深める研修情報', publishedAt: '2026年10月4日', source: '日本看護協会', description: '看護職向けの研修や学習機会を探すためのデモ記事です。', url: 'https://www.nurse.or.jp/' },
    { category: '制度', title: '看護職を支える制度情報を確認', publishedAt: '2026年10月3日', source: '厚生労働省', description: '働く看護職に関係する制度を確認するためのデモ記事です。', url: 'https://www.mhlw.go.jp/' },
    { category: '資格・認定', title: '資格・認定に関する公式情報', publishedAt: '2026年10月2日', source: '日本看護協会', description: '資格や認定の情報を公式サイトで確認するためのデモ記事です。', url: 'https://www.nurse.or.jp/nursing/qualification/' },
    { category: '働き方', title: '地域の看護職向け情報をチェック', publishedAt: '2026年10月1日', source: '都道府県看護協会', description: '地域の研修や働き方に関する情報を探すためのデモ記事です。', url: 'https://www.nurse.or.jp/about/outline/association/' },
    { category: '医療安全', title: '医療安全を学ぶための公的情報', publishedAt: '2026年9月30日', source: '日本医療機能評価機構', description: '医療安全に関する公的な情報源を確認するためのデモ記事です。', url: 'https://www.jq-hyouka.jcqhc.or.jp/' },
    { category: '看護技術', title: '看護実践に役立つ情報を探す', publishedAt: '2026年9月29日', source: '国立保健医療科学院', description: '看護の実践や学習に役立つ公的情報を探すためのデモ記事です。', url: 'https://www.niph.go.jp/' }
  ]
};

// 将来はこの関数だけをRSS/API/バックエンド取得に置き換えます。
function loadNursingNews() {
  return nursingNewsData;
}

document.addEventListener('DOMContentLoaded', () => {
  const data = loadNursingNews();
  const categoryRoot = document.querySelector('#news-categories');
  const resultRoot = document.querySelector('#news-results');
  const updated = document.querySelector('#news-updated');
  if (!categoryRoot || !resultRoot || !updated) return;

  const updatedDate = new Date(data.updatedAt);
  updated.textContent = `最終更新：${updatedDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} ${updatedDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}（デモ）`;

  const render = (selectedCategory = 'すべて') => {
    resultRoot.innerHTML = '';
    const items = selectedCategory === 'すべて' ? data.items : data.items.filter((item) => item.category === selectedCategory);
    items.forEach((item) => {
      const article = document.createElement('article');
      article.className = 'news-card';
      article.innerHTML = `<span class="article-category">${item.category}</span><h2>${item.title}</h2><p class="news-meta">公開日：${item.publishedAt}<br>情報元：${item.source}</p><p class="article-description">${item.description}</p><a class="button news-button" href="${item.url}" target="_blank" rel="noopener noreferrer">詳しく見る</a>`;
      resultRoot.appendChild(article);
    });
  };

  nursingNewsCategories.forEach((category, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'news-category-button';
    button.textContent = category;
    button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    button.addEventListener('click', () => {
      categoryRoot.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));
      render(category);
    });
    categoryRoot.appendChild(button);
  });
  render();
});
