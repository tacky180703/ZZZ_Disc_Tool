import { discMainStats } from './constants.js';
import { calculateProbabilities } from './calc.js';
import * as ui from './ui.js';

async function loadData() {
    try {
        const [charsRes, discsRes] = await Promise.all([
            fetch('data/characters.json'),
            fetch('data/discs.json')
        ]);
        if (!charsRes.ok || !discsRes.ok) throw new Error("Fetch failed");
        ui.state.baseCharacters = await charsRes.json();
        ui.state.allSets = await discsRes.json();
    } catch (error) {
        alert("マスターデータの読み込みに失敗しました。");
    }
}

async function init() {
    await loadData();

    const currentSetSelect = document.getElementById('currentSet');
    ui.state.allSets.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s; opt.innerText = s;
        currentSetSelect.appendChild(opt);
    });

    ui.renderCharModal();
    ui.renderStatGrids();
    ui.updateMainStats();
    ui.renderCharList();
    ui.updateVisuals();
}

function calculate() {
    const evalMode = document.querySelector('input[name="evalMode"]:checked').value;
    const currentSet = document.getElementById('currentSet').value;
    const discNum = parseInt(document.getElementById('discNum').value);
    const mainStat = document.getElementById('mainStat').value;
    const initialSlots = ui.state.selectedCurrents.length;
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = '';

    if (evalMode === 'predict' && initialSlots !== 3 && initialSlots !== 4) { 
        alert('現在のサブステータスを「3つ」または「4つ」選択してください。'); return; 
    }
    if (evalMode === 'finished') {
        if (initialSlots !== 4) { alert('Lv15評価にはサブステを4つすべて選択してください。'); return; }
        let totalUpgrades = ui.state.selectedCurrents.reduce((sum, id) => sum + (ui.state.upgradeCounts[id] || 0), 0);
        if (totalUpgrades > 5) { alert('強化回数の合計は最大5回までです。'); return; }
    }

    const matchingChars = ui.state.myCharacters.filter(c => c.sets.includes(currentSet));
    if (matchingChars.length === 0) {
        resultArea.innerHTML = `<div class="no-match-msg">このセットを使用するキャラクターが登録されていません。</div>`; return;
    }

    const isSubStatOverlap = ['hp_flat','hp_pct','atk_flat','atk_pct','def_flat','def_pct','crit_rate','crit_dmg','anomaly_prof'].includes(mainStat);
    const totalPoolSize = isSubStatOverlap ? 9 : 10;

    matchingChars.forEach(char => {
        let mainStatMismatch = false; let idealMainNames = "";
        if ([4, 5, 6].includes(discNum)) {
            const idealMains = char.mainStats[discNum] || [];
            if (idealMains.length > 0 && !idealMains.includes(mainStat)) {
                mainStatMismatch = true; 
                idealMainNames = idealMains.map(id => discMainStats[discNum].find(s=>s.id===id)?.name || id).join(' または ');
            }
        }
        if (mainStatMismatch) { ui.renderMismatchCard(char, idealMainNames, resultArea); return; }

        const validTargets = char.targets.filter(t => t !== mainStat);

        if (evalMode === 'finished') {
            let baseScore = 0, upgradeScore = 0;
            ui.state.selectedCurrents.forEach(c => {
                if (validTargets.includes(c)) { baseScore++; upgradeScore += (ui.state.upgradeCounts[c] || 0); }
            });
            ui.renderFinishedCard(char, validTargets, (baseScore + upgradeScore), baseScore, upgradeScore, resultArea);
        } else {
            let currentHits = 0; ui.state.selectedCurrents.forEach(c => { if (validTargets.includes(c)) currentHits++; });
            let unacquiredTargets = 0; validTargets.forEach(t => { if (!ui.state.selectedCurrents.includes(t)) unacquiredTargets++; });

            const exactProbs = calculateProbabilities(initialSlots, currentHits, unacquiredTargets, totalPoolSize);
            ui.renderPredictCard(char, validTargets, initialSlots, currentHits, unacquiredTargets, exactProbs, resultArea);
        }
    });
}

function saveCharacter() {
    const charId = document.getElementById('selectedBaseCharId').value;
    const name = document.getElementById('selectedBaseCharName').value;
    const imagePath = document.getElementById('selectedBaseCharImage').value; 
    if (!charId) { alert('キャラクターを選択してください。'); return; }
    if (ui.state.charSelectedSets.length === 0 || ui.state.charSelectedTargets.length === 0) { alert('適正セットと狙いサブステを選択してください。'); return; }

    const index = ui.state.myCharacters.findIndex(c => c.id === charId);
    const charData = {
        id: charId, name: name, image: imagePath,
        sets: [...ui.state.charSelectedSets],
        mainStats: { 4: [...ui.state.charSelectedMain4], 5: [...ui.state.charSelectedMain5], 6: [...ui.state.charSelectedMain6] },
        targets: [...ui.state.charSelectedTargets]
    };

    if (index !== -1) { ui.state.myCharacters[index] = charData; alert(name + ' を上書き保存しました！'); }
    else { ui.state.myCharacters.push(charData); alert(name + ' を登録しました！'); }

    localStorage.setItem('zzz_characters', JSON.stringify(ui.state.myCharacters));
    ui.clearCharSelection(); ui.renderCharList();
}

// HTMLのインライン onclick 用にグローバルスコープ（window）に大公開
window.switchTab = ui.switchTab;
window.openModal = ui.openModal;
window.closeModal = ui.closeModal;
window.clearCharSelection = ui.clearCharSelection;
window.updateMainStats = ui.updateMainStats;
window.handleMainStatChange = ui.handleMainStatChange;
window.renderUpgradeCounters = ui.renderUpgradeCounters;
window.calculate = calculate;
window.saveCharacter = saveCharacter;

window.addEventListener('DOMContentLoaded', init);