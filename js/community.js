document.addEventListener('DOMContentLoaded', () => {
  const key = 'communityPosts';
  const labels = { before: '子育て前', during: '子育て中', after: '子育て後' };
  const samples = [
    { stage: 'before', theme: '働き方', title: '妊娠・出産前に制度を確認する', content: '職場の制度や相談先を早めに調べ、家族とも働き方の希望を話しておきました。', nickname: 'ひだまりナース' },
    { stage: 'during', theme: '食事の準備', title: '夜勤前日に夕食を準備しておく', content: '夜勤の前日に作り置きを用意して、帰宅後の家族の食事がスムーズになるようにしています。', nickname: 'さくら' },
    { stage: 'during', theme: '急な発熱', title: '子どもの急な発熱時の連絡先を家族で共有する', content: '保育園からの連絡に備えて、家族・職場・病児保育の連絡先を一覧にして共有しています。', nickname: 'みどり' },
    { stage: 'during', theme: '学び', title: '通勤時間に看護記事を読む', content: '無理なく続けられるよう、通勤中に気になる看護記事をひとつ読む時間にしています。', nickname: 'こもれび' },
    { stage: 'during', theme: '勤務調整', title: '家族と勤務表を共有する', content: '勤務表が出たら家族の予定表に入れ、お互いに頼れる日を早めに確認しています。', nickname: 'あおい' },
    { stage: 'after', theme: 'キャリア', title: '少しずつ仕事のペースを戻す', content: '周囲に相談しながら担当を広げ、学び直しの時間も少しずつ確保しました。', nickname: 'つばき' }
  ];
  const buttons = [...document.querySelectorAll('.community-stage')], list = document.querySelector('#community-post-list'), heading = document.querySelector('#community-posts-title'), panel = document.querySelector('#community-form-panel'), form = document.querySelector('#community-form');
  let posts = JSON.parse(localStorage.getItem(key) || 'null') || samples, selected = 'before';
  const render = () => { heading.textContent = `${labels[selected]}の工夫`; list.innerHTML = ''; posts.filter((post) => post.stage === selected).forEach((post) => { const card = document.createElement('article'); card.className = 'community-post-card'; card.innerHTML = `<span class="article-category">${post.theme}</span><h3>${post.title}</h3><p>${post.content}</p><small>ニックネーム：${post.nickname}</small>`; list.append(card); }); };
  buttons.forEach((button) => button.addEventListener('click', () => { selected = button.dataset.stage; buttons.forEach((item) => { const active = item === button; item.classList.toggle('is-selected', active); item.setAttribute('aria-pressed', String(active)); }); render(); }));
  document.querySelector('#open-community-form').addEventListener('click', () => { panel.hidden = !panel.hidden; if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  form.addEventListener('submit', (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(form)); posts.push(data); localStorage.setItem(key, JSON.stringify(posts)); selected = data.stage; buttons.find((button) => button.dataset.stage === selected).click(); form.reset(); panel.hidden = true; list.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  render();
});
