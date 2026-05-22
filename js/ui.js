import { subStats, discMainStats } from './constants.js';

// アプリケーションの共有状態を保持するオブジェクト
export const state = {
    baseCharacters: [],
    allSets: [],
    myCharacters: JSON.parse(localStorage.getItem('zzz_characters')) || [],
    selectedCurrents: [],
    charSelectedSets: [],
    charSelectedMain4: [],
    charSelectedMain5: [],
    charSelectedMain6: [],
    charSelectedTargets: [],
    upgradeCounts: {}
};

export function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
}

export function openModal() { document.getElementById('charModal').style.display = 'block'; }
export function closeModal() { document.getElementById('charModal').style.display = 'none'; }

export function renderCharModal() {
    const grid = document.getElementById('modalCharGrid');
    grid.innerHTML = '';
    state.baseCharacters.forEach(c => {
        const div = document.createElement('div');
        div.className = 'char-item';
        div.onclick = () => selectCharacter(c.id);
        const fallbackImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><rect width='50' height='50' fill='%23333'/></svg>";
        div.innerHTML = `<!-- <img src="${c.image}" alt="${c.name}" onerror="this.src='${fallbackImg}'"> --><span>${c.name}</span>`;
        grid.appendChild(div);
    });
}

function selectCharacter(charId) {
    const charInfo = state.baseCharacters.find(c => c.id === charId);
    if (!charInfo) return;

    document.getElementById('selectedBaseCharId').value = charId;
    document.getElementById('selectedBaseCharName').value = charInfo.name;
    document.getElementById('selectedBaseCharImage').value = charInfo.image || "";
    
    // 画像読み込みを無効化（コメントアウト）
    // document.getElementById('previewCharImg').src = charInfo.image;
    document.getElementById('previewCharName').innerText = charInfo.name;
    document.getElementById('openCharModalBtn').style.display = 'none';
    document.getElementById('selectedCharPreview').style.display = 'flex';

    const existingChar = state.myCharacters.find(c => c.id === charId);
    if (existingChar) {
        document.getElementById('previewStatusMsg').innerText = "登録済みの設定を編集中...";
        state.charSelectedSets = [...existingChar.sets];
        state.charSelectedMain4 = [...(existingChar.mainStats[4] || [])];
        state.charSelectedMain5 = [...(existingChar.mainStats[5] || [])];
        state.charSelectedMain6 = [...(existingChar.mainStats[6] || [])];
        state.charSelectedTargets = [...existingChar.targets];
    } else {
        document.getElementById('previewStatusMsg').innerText = "未登録（新規作成）";
        state.charSelectedSets = []; state.charSelectedMain4 = []; state.charSelectedMain5 = []; state.charSelectedMain6 = []; state.charSelectedTargets = [];
    }
    updateVisuals();
    closeModal();
}

export function clearCharSelection() {
    document.getElementById('selectedBaseCharId').value = '';
    document.getElementById('selectedBaseCharName').value = '';
    document.getElementById('selectedBaseCharImage').value = '';
    document.getElementById('selectedCharPreview').style.display = 'none';
    document.getElementById('openCharModalBtn').style.display = 'block';
    state.charSelectedSets = []; state.charSelectedMain4 = []; state.charSelectedMain5 = []; state.charSelectedMain6 = []; state.charSelectedTargets = [];
    updateVisuals();
}

export function toggleArray(arrName, val, limit) {
    const idx = state[arrName].indexOf(val);
    if (idx > -1) state[arrName].splice(idx, 1);
    else {
        if (state[arrName].length >= limit && limit > 0) alert('選択上限に達しています。');
        else state[arrName].push(val);
    }
    updateVisuals();
}

export function updateVisuals() {
    subStats.forEach(stat => {
        const btnC = document.getElementById('current_' + stat.id);
        if(btnC && !btnC.classList.contains('disabled')) {
            btnC.classList.toggle('current-active', state.selectedCurrents.includes(stat.id));
        }
    });
    state.allSets.forEach((s, idx) => {
        const btn = document.getElementById('char_set_' + idx);
        if(btn) btn.classList.toggle('target-active', state.charSelectedSets.includes(s));
    });
    discMainStats[4].forEach(s => document.getElementById('char_main4_'+s.id)?.classList.toggle('target-active', state.charSelectedMain4.includes(s.id)));
    discMainStats[5].forEach(s => document.getElementById('char_main5_'+s.id)?.classList.toggle('target-active', state.charSelectedMain5.includes(s.id)));
    discMainStats[6].forEach(s => document.getElementById('char_main6_'+s.id)?.classList.toggle('target-active', state.charSelectedMain6.includes(s.id)));
    subStats.forEach(stat => {
        const btnT = document.getElementById('char_target_' + stat.id);
        if(btnT) btnT.classList.toggle('target-active', state.charSelectedTargets.includes(stat.id));
    });
}

// 各種ボタン（サブステ・セット・メイン選択・狙いサブステ）を描画する
export function renderStatGrids() {
    // 現在のサブステ選択グリッド
    const currentGrid = document.getElementById('currentGrid');
    if (currentGrid) {
        currentGrid.innerHTML = '';
        subStats.forEach(stat => {
            const btn = document.createElement('div');
            btn.className = 'stat-btn';
            btn.id = 'current_' + stat.id;
            btn.innerText = stat.name;
            btn.onclick = () => toggleArray('selectedCurrents', stat.id, 4);
            currentGrid.appendChild(btn);
        });
    }

    // キャラの適正ディスクセットグリッド
    const setsGrid = document.getElementById('charSetsGrid');
    if (setsGrid) {
        setsGrid.innerHTML = '';
        state.allSets.forEach((s, idx) => {
            const btn = document.createElement('div');
            btn.className = 'stat-btn';
            btn.id = 'char_set_' + idx;
            btn.innerText = s;
            btn.onclick = () => toggleArray('charSelectedSets', s, 0);
            setsGrid.appendChild(btn);
        });
    }

    // 各部位の理想メインステグリッド
    const main4 = document.getElementById('charMain4Grid');
    if (main4) {
        main4.innerHTML = '';
        (discMainStats[4] || []).forEach(s => {
            const btn = document.createElement('div');
            btn.className = 'stat-btn';
            btn.id = 'char_main4_' + s.id;
            btn.innerText = s.name;
            btn.onclick = () => toggleArray('charSelectedMain4', s.id, 0);
            main4.appendChild(btn);
        });
    }

    const main5 = document.getElementById('charMain5Grid');
    if (main5) {
        main5.innerHTML = '';
        (discMainStats[5] || []).forEach(s => {
            const btn = document.createElement('div');
            btn.className = 'stat-btn';
            btn.id = 'char_main5_' + s.id;
            btn.innerText = s.name;
            btn.onclick = () => toggleArray('charSelectedMain5', s.id, 0);
            main5.appendChild(btn);
        });
    }

    const main6 = document.getElementById('charMain6Grid');
    if (main6) {
        main6.innerHTML = '';
        (discMainStats[6] || []).forEach(s => {
            const btn = document.createElement('div');
            btn.className = 'stat-btn';
            btn.id = 'char_main6_' + s.id;
            btn.innerText = s.name;
            btn.onclick = () => toggleArray('charSelectedMain6', s.id, 0);
            main6.appendChild(btn);
        });
    }

    // キャラの狙いサブステグリッド
    const targetGrid = document.getElementById('charTargetGrid');
    if (targetGrid) {
        targetGrid.innerHTML = '';
        subStats.forEach(stat => {
            const btn = document.createElement('div');
            btn.className = 'stat-btn';
            btn.id = 'char_target_' + stat.id;
            btn.innerText = stat.name;
            btn.onclick = () => toggleArray('charSelectedTargets', stat.id, 4);
            targetGrid.appendChild(btn);
        });
    }

    // 生成後に現在の状態を反映
    updateVisuals();
}

export function updateMainStats() {
    const discNum = document.getElementById('discNum').value;
    const mainStatSelect = document.getElementById('mainStat');
    mainStatSelect.innerHTML = '';
    discMainStats[discNum].forEach(stat => {
        const option = document.createElement('option');
        option.value = stat.id; option.innerText = stat.name;
        mainStatSelect.appendChild(option);
    });
    handleMainStatChange();
}

export function handleMainStatChange() {
    const mainStat = document.getElementById('mainStat').value;
    const isSubStatOverlap = subStats.some(s => s.id === mainStat);
    if (isSubStatOverlap) state.selectedCurrents = state.selectedCurrents.filter(id => id !== mainStat);
    subStats.forEach(stat => {
        const btnC = document.getElementById('current_' + stat.id);
        if (stat.id === mainStat && isSubStatOverlap) {
            btnC.classList.add('disabled'); btnC.classList.remove('current-active');
        } else btnC.classList.remove('disabled');
    });
    updateVisuals();
    renderUpgradeCounters();
}

export function renderUpgradeCounters() {
    const evalMode = document.querySelector('input[name="evalMode"]:checked').value;
    const area = document.getElementById('finishedUpgradesArea');
    const list = document.getElementById('upgradeCountersList');

    if (evalMode === 'predict') { area.style.display = 'none'; return; }
    area.style.display = 'block';

    if (state.selectedCurrents.length !== 4) {
        list.innerHTML = '<div class="note" style="color: #f87171;">※上の③でサブステータスを【必ず4つ】選択してください。</div>';
        return;
    }

    list.innerHTML = '';
    state.selectedCurrents.forEach(statId => {
        const statName = subStats.find(s => s.id === statId).name;
        const currentVal = state.upgradeCounts[statId] || 0;
        const item = document.createElement('div');
        item.className = 'upgrade-counter-item';
        item.innerHTML = `
            <span>${statName}</span>
            <select id="count_${statId}">
                <option value="0" ${currentVal===0?'selected':''}>+0</option>
                <option value="1" ${currentVal===1?'selected':''}>+1</option>
                <option value="2" ${currentVal===2?'selected':''}>+2</option>
                <option value="3" ${currentVal===3?'selected':''}>+3</option>
                <option value="4" ${currentVal===4?'selected':''}>+4</option>
                <option value="5" ${currentVal===5?'selected':''}>+5</option>
            </select>`;
        list.appendChild(item);
        document.getElementById(`count_${statId}`).onchange = (e) => { state.upgradeCounts[statId] = parseInt(e.target.value); };
    });
}

export function renderCharList() {
    const area = document.getElementById('charListArea'); area.innerHTML = '';
    if (state.myCharacters.length === 0) { area.innerHTML = '<p style="color:#888; font-size:14px;">まだ登録されていません。</p>'; return; }
    state.myCharacters.forEach(c => {
        const targetNames = c.targets.map(t => subStats.find(s => s.id === t)?.name).join(', ');
        let mainStr = [];
        if(c.mainStats[4]?.length) mainStr.push("4番:" + c.mainStats[4].map(id => discMainStats[4].find(s=>s.id===id)?.name).join('/'));
        if(c.mainStats[5]?.length) mainStr.push("5番:" + c.mainStats[5].map(id => discMainStats[5].find(s=>s.id===id)?.name).join('/'));
        if(c.mainStats[6]?.length) mainStr.push("6番:" + c.mainStats[6].map(id => discMainStats[6].find(s=>s.id===id)?.name).join('/'));
        area.innerHTML += `<div class="char-list-item"><div style="flex-grow: 1;"><div class="char-list-info"><strong>${c.name}</strong> <span style="color:#ffd700;font-size:12px;">[${targetNames}]</span></div><div class="char-list-sets">適正: ${c.sets.join(' / ')}</div><div class="char-list-mains">${mainStr.length ? mainStr.join(' ｜ ') : 'メインステ指定なし'}</div></div></div>`;
    });
}

export function renderMismatchCard(char, idealNames, container) {
    const imgHTML = char.image ? `<!-- <img src="${char.image}" class="char-icon" onerror="this.style.display='none'"> -->` : '';
    container.innerHTML += `<div class="char-card" style="border-left-color: #7f1d1d;"><div class="char-card-title"><div class="char-title-container">${imgHTML}<span>${char.name} 用の判定</span></div></div><div class="advice-box advice-trash-hard">【メイン不一致のため即分解推奨】<br><span style="font-size:12px; font-weight:normal;">理想のメインステータス: <strong>${idealNames}</strong></span></div></div>`;
}

export function renderPredictCard(char, validTargets, initial, currentHits, unacquiredTargets, exactProbs, container) {
    const totalTargets = validTargets.length;
    let advice = { class: "advice-trash-hard", text: "【即分解推奨】" };

    if (totalTargets === 0) advice = { class: "advice-trash-hard", text: "【即分解推奨】有効な狙いサブステータスがありません。" };
    else if (currentHits === 0) advice = { class: "advice-trash-hard", text: (initial === 4 || unacquiredTargets === 0) ? "【即分解推奨】当たりゼロです。エサにしましょう。" : "【基本は分解推奨】Lv3で当たりを引く確率が低すぎます。" };
    else if (currentHits === totalTargets || currentHits >= 3) advice = { class: "advice-god", text: "【絶対キープ！】神ディスク候補です。Lv15まで強化しましょう！" };
    else if (currentHits === 2) advice = { class: "advice-roll-high", text: "【Lv6〜9まで様子見】良ディスクの原石。当たりに吸われれば続行です。" };
    else if (currentHits === 1) advice = { class: "advice-roll-low", text: (initial === 4) ? "【Lv6まで様子見】当たり1つなので渋め。" : "【Lv3〜6まで様子見】Lv3で追加されるか、Lv6までに強化されれば続行です。" };

    const targetLabels = validTargets.map(t => subStats.find(s => s.id === t)?.name).map(n => `<span>${n}</span>`).join('');
    const imgHTML = char.image ? `<!-- <img src="${char.image}" class="char-icon" onerror="this.style.display='none'"> -->` : '';
    
    let html = `<div class="char-card"><div class="char-card-title"><div class="char-title-container">${imgHTML}<span>${char.name} 用の判定</span></div></div><div class="char-targets">狙い: ${targetLabels || '<span>なし(メイン被り等)</span>'}</div><div class="advice-box ${advice.class}">${advice.text}</div><div style="background: #111; padding: 10px; border-radius: 5px;">`;

    let maxRolls = (initial === 4) ? 5 : 4;
    let hasDisplayProb = false;
    for (let targetHits = 1; targetHits <= maxRolls; targetHits++) {
        let probExact = exactProbs[targetHits]; 
        let probStr = (probExact * 100).toFixed(2);
        if (probStr > 0.00) {
            html += `<div class="result-item"><span>ちょうど ${targetHits}回 強化される</span><span class="highlight">${probStr}%</span></div>`;
            hasDisplayProb = true;
        }
    }
    if (!hasDisplayProb) html += `<div class="result-item"><span>強化される確率</span><span class="highlight">0.00%</span></div>`;
    let probZero = (exactProbs[0] * 100).toFixed(2);
    html += `<div class="note">※1回も当たりに吸われない確率: ${probZero}%</div></div></div>`;
    container.innerHTML += html;
}

export function renderFinishedCard(char, validTargets, totalScore, baseScore, upgradeScore, container) {
    let advice = {};
    if (validTargets.length === 0) advice = { class: "advice-trash-hard", text: "【即分解推奨】有効な狙いサブステータスがありません。" };
    else if (totalScore >= 6) advice = { class: "advice-god", text: "【神ディスク！】理想的な仕上がりです。文句なしの最強装備！" };
    else if (totalScore >= 4) advice = { class: "advice-roll-high", text: "【良ディスク！】十分に一線級で活躍できる素晴らしい性能です。" };
    else if (totalScore === 3) advice = { class: "advice-roll-low", text: "【妥協ライン】繋ぎとしては十分使えます。厳選に疲れたらここでストップ。" };
    else if (totalScore === 2) advice = { class: "advice-trash-soft", text: "【うーん…】ハズレに多く吸われてしまいました。仮装備です。" };
    else advice = { class: "advice-trash-hard", text: "【エサ推奨】実用レベルに達していません。他のディスクの強化素材にしましょう。" };

    const targetLabels = validTargets.map(t => subStats.find(s => s.id === t)?.name).map(n => `<span>${n}</span>`).join('');
    const imgHTML = char.image ? `<!-- <img src="${char.image}" class="char-icon" onerror="this.style.display='none'"> -->` : '';

    container.innerHTML += `
    <div class="char-card">
        <div class="char-card-title"><div class="char-title-container">${imgHTML}<span>${char.name} 用の判定 (Lv15)</span></div></div>
        <div class="char-targets">狙い: ${targetLabels || '<span>なし(メイン被り等)</span>'}</div>
        <div class="advice-box ${advice.class}">${advice.text}</div>
        <div style="background: #111; padding: 15px; border-radius: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight:bold; font-size:15px;">有効ステータス合計スコア</span>
                <span class="highlight" style="font-size:24px; color:#ffd700;">${totalScore} <span style="font-size:14px; color:#aaa;">pt</span></span>
            </div>
            <div class="note" style="text-align: right; margin-top: 5px; border-top: 1px dashed #444; padding-top: 8px;">
                内訳（初期一致: <strong>${baseScore}</strong>箇所 ＋ 強化: <strong>${upgradeScore}</strong>回）
            </div>
        </div>
    </div>`;
}