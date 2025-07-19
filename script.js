// グローバル変数
let patientData = {
    evaluation: {},
    treatment: {},
    thinking: {}
};

// 患者管理システム
let patientManagement = {
    patients: [],
    currentPatientIndex: 0,
    nextPatientId: 1
};

// チャット形式の対話システム
let conversationState = {
    isActive: false,
    currentStep: 0,
    patientInfo: {},
    answers: {},
    conversationHistory: []
};

// 質問パターンの定義
const questionPatterns = {
    // 評価段階の質問
    evaluation: [
        {
            id: 'eval_1',
            question: '患者さんの主訴を詳しく教えてください。どのような動作で困難を感じていますか？',
            category: 'evaluation',
            followUp: 'eval_2'
        },
        {
            id: 'eval_2',
            question: '患者さんの身体機能で最も低下している部分は何ですか？筋力、関節可動域、バランスのどれが問題ですか？',
            category: 'evaluation',
            followUp: 'eval_3'
        },
        {
            id: 'eval_3',
            question: 'ADL評価でどの項目が最も困難でしたか？その理由は何だと思いますか？',
            category: 'evaluation',
            followUp: 'analysis_1'
        }
    ],
    // 分析段階の質問
    analysis: [
        {
            id: 'analysis_1',
            question: '患者さんの問題の根本原因は何だと思いますか？身体機能の低下、環境因子、心理的要因のどれが主ですか？',
            category: 'analysis',
            followUp: 'analysis_2'
        },
        {
            id: 'analysis_2',
            question: '患者さんの生活環境はどうですか？自宅での動作に影響する要因はありますか？',
            category: 'analysis',
            followUp: 'analysis_3'
        },
        {
            id: 'analysis_3',
            question: '患者さんの意欲や認知機能はどうですか？治療への参加意欲に影響する要因はありますか？',
            category: 'analysis',
            followUp: 'planning_1'
        }
    ],
    // 計画段階の質問
    planning: [
        {
            id: 'planning_1',
            question: 'この患者さんに最も適した治療アプローチは何ですか？運動療法、ADL訓練、環境調整のどれを優先しますか？',
            category: 'planning',
            followUp: 'planning_2'
        },
        {
            id: 'planning_2',
            question: '短期目標（1-2週間）を具体的に設定してください。測定可能な目標にしてください。',
            category: 'planning',
            followUp: 'planning_3'
        },
        {
            id: 'planning_3',
            question: '長期目標（1-3ヶ月）を設定してください。患者さんの生活にどのような改善を期待しますか？',
            category: 'planning',
            followUp: 'prediction_1'
        }
    ],
    // 予測段階の質問
    prediction: [
        {
            id: 'prediction_1',
            question: 'この患者さんの回復予測はどうですか？根拠となる要因を教えてください。',
            category: 'prediction',
            followUp: 'prediction_2'
        },
        {
            id: 'prediction_2',
            question: '治療期間はどのくらい必要だと思いますか？その根拠は何ですか？',
            category: 'prediction',
            followUp: 'risk_1'
        }
    ],
    // リスク管理の質問
    risk: [
        {
            id: 'risk_1',
            question: 'この患者さんの治療で注意すべきリスクは何ですか？転倒、疼痛増強、その他のリスクはありますか？',
            category: 'risk',
            followUp: 'risk_2'
        },
        {
            id: 'risk_2',
            question: 'リスクを回避するための対策を考えてください。どのような予防策を講じますか？',
            category: 'risk',
            followUp: null
        }
    ]
};

// DOM読み込み完了後の初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadConversation(); // 初期化時に履歴を読み込み
});

// アプリケーション初期化
function initializeApp() {
    // 患者管理システムの初期化
    initializePatientManagement();
    
    // タブ切り替え機能
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // アクティブクラスの切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // ADL評価ボタンの機能
    setupADLAssessmentButtons();

    // 認知機能評価ボタンの機能
    setupCognitiveAssessmentButtons();

    // 筋力評価ボタンの機能
    setupMuscleStrengthButtons();

    // ROM評価ボタンの機能
    setupROMButtons();

    // バランス評価ボタンの機能
    setupBalanceAssessmentButtons();

    // 感覚評価ボタンの機能
    setupSensoryAssessmentButtons();

    // 治療方法のチェックボックス機能
    setupTreatmentMethods();

    // フォームの自動保存機能
    setupAutoSave();

    // チャット形式の対話システムの機能
    setupConversationSystem();
}

// 患者管理システムの初期化
function initializePatientManagement() {
    // 保存された患者データを読み込み
    loadPatientData();
    
    // 患者が存在しない場合は初期患者を作成
    if (patientManagement.patients.length === 0) {
        addNewPatient();
    } else {
        // 患者リストを表示
        renderPatientList();
        // 現在の患者を選択
        selectPatient(patientManagement.currentPatientIndex);
    }
}

// 患者データの読み込み
function loadPatientData() {
    const savedPatients = localStorage.getItem('patientManagement');
    if (savedPatients) {
        const data = JSON.parse(savedPatients);
        patientManagement.patients = data.patients || [];
        patientManagement.currentPatientIndex = data.currentPatientIndex || 0;
        patientManagement.nextPatientId = data.nextPatientId || 1;
    }
}

// 患者データの保存
function savePatientData() {
    localStorage.setItem('patientManagement', JSON.stringify({
        patients: patientManagement.patients,
        currentPatientIndex: patientManagement.currentPatientIndex,
        nextPatientId: patientManagement.nextPatientId
    }));
}

// 新しい患者を追加
function addNewPatient() {
    const newPatient = {
        id: patientManagement.nextPatientId++,
        name: `患者${patientManagement.patients.length + 1}`,
        data: {
            evaluation: {},
            treatment: {},
            thinking: {}
        }
    };
    
    patientManagement.patients.push(newPatient);
    patientManagement.currentPatientIndex = patientManagement.patients.length - 1;
    
    // 患者リストを更新
    renderPatientList();
    
    // 新しい患者を選択
    selectPatient(patientManagement.currentPatientIndex);
    
    // データを保存
    savePatientData();
    
    showSuccessMessage('新しい患者を追加しました');
}

// 患者リストを表示
function renderPatientList() {
    const patientList = document.getElementById('patient-list');
    if (!patientList) return;
    
    patientList.innerHTML = '';
    
    patientManagement.patients.forEach((patient, index) => {
        const patientItem = document.createElement('div');
        patientItem.className = `patient-item ${index === patientManagement.currentPatientIndex ? 'active' : ''}`;
        patientItem.onclick = () => selectPatient(index);
        
        patientItem.innerHTML = `
            <div class="patient-item-name">${patient.name}</div>
            <div class="patient-item-actions">
                <button onclick="event.stopPropagation(); deletePatient(${index})" title="削除">
                    🗑️
                </button>
            </div>
        `;
        
        patientList.appendChild(patientItem);
    });
}

// 患者を選択
function selectPatient(index) {
    if (index < 0 || index >= patientManagement.patients.length) return;
    
    // 現在の患者データを保存
    saveCurrentPatientData();
    
    // 患者を切り替え
    patientManagement.currentPatientIndex = index;
    const patient = patientManagement.patients[index];
    
    // 患者リストの表示を更新
    renderPatientList();
    
    // フォームに患者データを読み込み
    loadPatientFormData(patient);
    
    // タイトルを更新
    updatePatientTitle();
    
    // 削除ボタンの表示/非表示を切り替え
    toggleDeleteButton();
    
    // データを保存
    savePatientData();
}

// 現在の患者データを保存
function saveCurrentPatientData() {
    if (patientManagement.patients.length === 0) return;
    
    const currentPatient = patientManagement.patients[patientManagement.currentPatientIndex];
    if (!currentPatient) return;
    
    // フォームデータを取得
    const formData = {
        name: document.getElementById('patient-name').value || '',
        age: document.getElementById('patient-age').value || '',
        diagnosis: document.getElementById('diagnosis').value || '',
        chiefComplaint: document.getElementById('chief-complaint').value || '',
        medicalHistory: document.getElementById('medical-history').value || '',
        currentCondition: document.getElementById('current-condition').value || ''
    };
    
    // 患者データを更新
    currentPatient.data.evaluation = { ...currentPatient.data.evaluation, ...formData };
    
    // 患者名を更新
    if (formData.name) {
        currentPatient.name = formData.name;
    }
}

// 患者フォームデータを読み込み
function loadPatientFormData(patient) {
    const data = patient.data.evaluation;
    
    document.getElementById('patient-name').value = data.name || '';
    document.getElementById('patient-age').value = data.age || '';
    document.getElementById('diagnosis').value = data.diagnosis || '';
    document.getElementById('chief-complaint').value = data.chiefComplaint || '';
    document.getElementById('medical-history').value = data.medicalHistory || '';
    document.getElementById('current-condition').value = data.currentCondition || '';
}

// 患者タイトルを更新
function updatePatientTitle() {
    const titleElement = document.getElementById('current-patient-title');
    if (titleElement && patientManagement.patients.length > 0) {
        const currentPatient = patientManagement.patients[patientManagement.currentPatientIndex];
        titleElement.textContent = currentPatient.name;
    }
}

// 削除ボタンの表示/非表示を切り替え
function toggleDeleteButton() {
    const deleteBtn = document.querySelector('.delete-patient-btn');
    if (deleteBtn) {
        deleteBtn.style.display = patientManagement.patients.length > 1 ? 'flex' : 'none';
    }
}

// 患者を削除
function deletePatient(index) {
    if (patientManagement.patients.length <= 1) {
        showErrorMessage('患者は最低1人は必要です');
        return;
    }
    
    if (confirm('この患者を削除しますか？')) {
        patientManagement.patients.splice(index, 1);
        
        // 現在の患者インデックスを調整
        if (patientManagement.currentPatientIndex >= index) {
            patientManagement.currentPatientIndex = Math.max(0, patientManagement.currentPatientIndex - 1);
        }
        
        // 患者リストを更新
        renderPatientList();
        
        // 新しい現在の患者を選択
        selectPatient(patientManagement.currentPatientIndex);
        
        // データを保存
        savePatientData();
        
        showSuccessMessage('患者を削除しました');
    }
}

// 現在の患者を削除
function deleteCurrentPatient() {
    deletePatient(patientManagement.currentPatientIndex);
}

// チャット形式の対話システムの機能設定
function setupConversationSystem() {
    const startConversationBtn = document.getElementById('start-conversation-btn');
    const saveConversationBtn = document.getElementById('save-conversation-btn');
    const endConversationBtn = document.getElementById('end-conversation-btn');
    const userAnswerInput = document.getElementById('user-answer');
    const chatMessages = document.getElementById('chat-messages');

    if (startConversationBtn && saveConversationBtn && endConversationBtn && userAnswerInput && chatMessages) {
        startConversationBtn.addEventListener('click', startConversation);
        saveConversationBtn.addEventListener('click', saveConversation);
        endConversationBtn.addEventListener('click', endConversation);

        if (userAnswerInput) {
            userAnswerInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitAnswer();
                }
            });
        }
    }
}

// ADL評価ボタンの機能設定
function setupADLAssessmentButtons() {
    const assessmentButtons = document.querySelectorAll('.adl-assessment-buttons .assessment-btn');
    const assessmentContents = document.querySelectorAll('.adl-assessment-buttons + .assessment-content, .adl-assessment-buttons ~ .assessment-content');

    assessmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const assessmentType = button.getAttribute('data-assessment');
            
            // 同じグループ内のすべてのボタンからアクティブクラスを削除
            assessmentButtons.forEach(btn => btn.classList.remove('active'));
            // 同じグループ内のすべてのコンテンツを非表示
            assessmentContents.forEach(content => content.style.display = 'none');
            
            // クリックされたボタンをアクティブに
            button.classList.add('active');
            // 対応するコンテンツを表示
            const targetContent = document.getElementById(`${assessmentType}-assessment`);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
}

// 認知機能評価ボタンの機能設定
function setupCognitiveAssessmentButtons() {
    const assessmentButtons = document.querySelectorAll('.cognitive-assessment-buttons .assessment-btn');
    const assessmentContents = document.querySelectorAll('.cognitive-assessment-buttons + .assessment-content, .cognitive-assessment-buttons ~ .assessment-content');

    assessmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const assessmentType = button.getAttribute('data-assessment');
            
            // 同じグループ内のすべてのボタンからアクティブクラスを削除
            assessmentButtons.forEach(btn => btn.classList.remove('active'));
            // 同じグループ内のすべてのコンテンツを非表示
            assessmentContents.forEach(content => content.style.display = 'none');
            
            // クリックされたボタンをアクティブに
            button.classList.add('active');
            // 対応するコンテンツを表示
            const targetContent = document.getElementById(`${assessmentType}-assessment`);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
}

// 筋力評価ボタンの機能設定
function setupMuscleStrengthButtons() {
    const assessmentButtons = document.querySelectorAll('.muscle-strength-buttons .assessment-btn');
    const assessmentContents = document.querySelectorAll('.muscle-strength-buttons + .assessment-content, .muscle-strength-buttons ~ .assessment-content');

    assessmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const assessmentType = button.getAttribute('data-assessment');
            
            // 同じグループ内のすべてのボタンからアクティブクラスを削除
            assessmentButtons.forEach(btn => btn.classList.remove('active'));
            // 同じグループ内のすべてのコンテンツを非表示
            assessmentContents.forEach(content => content.style.display = 'none');
            
            // クリックされたボタンをアクティブに
            button.classList.add('active');
            // 対応するコンテンツを表示
            const targetContent = document.getElementById(`${assessmentType}-assessment`);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
}

// ROM評価ボタンの機能設定
function setupROMButtons() {
    const assessmentButtons = document.querySelectorAll('.rom-buttons .assessment-btn');
    const assessmentContents = document.querySelectorAll('.rom-buttons + .assessment-content, .rom-buttons ~ .assessment-content');

    assessmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const assessmentType = button.getAttribute('data-assessment');
            
            // 同じグループ内のすべてのボタンからアクティブクラスを削除
            assessmentButtons.forEach(btn => btn.classList.remove('active'));
            // 同じグループ内のすべてのコンテンツを非表示
            assessmentContents.forEach(content => content.style.display = 'none');
            
            // クリックされたボタンをアクティブに
            button.classList.add('active');
            // 対応するコンテンツを表示
            const targetContent = document.getElementById(`${assessmentType}-assessment`);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
}

// バランス評価ボタンの機能設定
function setupBalanceAssessmentButtons() {
    const assessmentButtons = document.querySelectorAll('.balance-assessment-buttons .assessment-btn');
    const assessmentContents = document.querySelectorAll('.balance-assessment-buttons + .assessment-content, .balance-assessment-buttons ~ .assessment-content');

    assessmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const assessmentType = button.getAttribute('data-assessment');
            
            // 同じグループ内のすべてのボタンからアクティブクラスを削除
            assessmentButtons.forEach(btn => btn.classList.remove('active'));
            // 同じグループ内のすべてのコンテンツを非表示
            assessmentContents.forEach(content => content.style.display = 'none');
            
            // クリックされたボタンをアクティブに
            button.classList.add('active');
            // 対応するコンテンツを表示
            const targetContent = document.getElementById(`${assessmentType}-assessment`);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
}

// 感覚評価ボタンの機能設定
function setupSensoryAssessmentButtons() {
    const assessmentButtons = document.querySelectorAll('.sensory-assessment-buttons .assessment-btn');
    const assessmentContents = document.querySelectorAll('.sensory-assessment-buttons + .assessment-content, .sensory-assessment-buttons ~ .assessment-content');

    assessmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const assessmentType = button.getAttribute('data-assessment');
            
            // 同じグループ内のすべてのボタンからアクティブクラスを削除
            assessmentButtons.forEach(btn => btn.classList.remove('active'));
            // 同じグループ内のすべてのコンテンツを非表示
            assessmentContents.forEach(content => content.style.display = 'none');
            
            // クリックされたボタンをアクティブに
            button.classList.add('active');
            // 対応するコンテンツを表示
            const targetContent = document.getElementById(`${assessmentType}-assessment`);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
}

// 治療方法のチェックボックス機能設定
function setupTreatmentMethods() {
    const treatmentCheckboxes = document.querySelectorAll('.treatment-methods input[type="checkbox"]');
    
    treatmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const treatmentType = checkbox.getAttribute('data-treatment');
            const detailSection = document.getElementById(`${treatmentType}-details`);
            
            if (checkbox.checked) {
                // チェックされた場合、詳細セクションを表示
                if (detailSection) {
                    detailSection.style.display = 'block';
                }
            } else {
                // チェックが外された場合、詳細セクションを非表示
                if (detailSection) {
                    detailSection.style.display = 'none';
                    // テキストエリアの内容もクリア
                    const textarea = detailSection.querySelector('textarea');
                    if (textarea) {
                        textarea.value = '';
                    }
                }
            }
        });
    });
}

// フォームの自動保存機能
function setupAutoSave() {
    const formElements = document.querySelectorAll('input, textarea, select');
    
    formElements.forEach(element => {
        element.addEventListener('input', () => {
            // 患者データを自動保存
            saveCurrentPatientData();
        });
        
        element.addEventListener('change', () => {
            // 患者データを自動保存
            saveCurrentPatientData();
        });
    });
}

// 保存機能を患者管理システムに対応
function saveEvaluation() {
    saveCurrentPatientData();
    showSuccessMessage('患者評価を保存しました');
}

function saveTreatment() {
    // 治療データを現在の患者に保存
    if (patientManagement.patients.length > 0) {
        const currentPatient = patientManagement.patients[patientManagement.currentPatientIndex];
        currentPatient.data.treatment = getTreatmentData();
        savePatientData();
    }
    showSuccessMessage('治療記録を保存しました');
}

function saveThinking() {
    // 思考データを現在の患者に保存
    if (patientManagement.patients.length > 0) {
        const currentPatient = patientManagement.patients[patientManagement.currentPatientIndex];
        currentPatient.data.thinking = getThinkingData();
        savePatientData();
    }
    showSuccessMessage('思考記録を保存しました');
}

// 患者別のデータ取得機能
function getCurrentPatientEvaluationData() {
    if (patientManagement.patients.length === 0) return {};
    
    const currentPatient = patientManagement.patients[patientManagement.currentPatientIndex];
    return currentPatient.data.evaluation || {};
}

function getCurrentPatientTreatmentData() {
    if (patientManagement.patients.length === 0) return {};
    
    const currentPatient = patientManagement.patients[patientManagement.currentPatientIndex];
    return currentPatient.data.treatment || {};
}

function getCurrentPatientThinkingData() {
    if (patientManagement.patients.length === 0) return {};
    
    const currentPatient = patientManagement.patients[patientManagement.currentPatientIndex];
    return currentPatient.data.thinking || {};
}

// 評価データの取得
function getEvaluationData() {
    return {
        patientName: document.getElementById('patient-name')?.value || '',
        patientAge: document.getElementById('patient-age')?.value || '',
        diagnosis: document.getElementById('diagnosis')?.value || '',
        chiefComplaint: document.getElementById('chief-complaint')?.value || '',
        medicalHistory: document.getElementById('medical-history')?.value || '',
        currentCondition: document.getElementById('current-condition')?.value || '',
        cognitiveAssessment: document.getElementById('cognitive-assessment')?.value || '',
        muscleStrength: document.getElementById('muscle-strength')?.value || '',
        rangeOfMotion: document.getElementById('range-of-motion')?.value || '',
        balanceAssessment: document.getElementById('balance-assessment')?.value || '',
        sensoryAssessment: document.getElementById('sensory-assessment')?.value || '',
        adlData: getADLData()
    };
}

// ADLデータの取得
function getADLData() {
    // 現在はFIMとBarthel Indexのボタンがあるだけなので、空のオブジェクトを返す
    // 後で詳細な評価項目が追加されたら、そのデータを取得するように変更
    return {};
}

// 治療データの取得
function getTreatmentData() {
    const selectedMethods = [];
    const treatmentDetails = {};
    
    document.querySelectorAll('.treatment-methods input[type="checkbox"]:checked').forEach(checkbox => {
        const methodName = checkbox.value;
        const treatmentType = checkbox.getAttribute('data-treatment');
        selectedMethods.push(methodName);
        
        // 詳細記録も取得
        const detailSection = document.getElementById(`${treatmentType}-details`);
        if (detailSection) {
            const textarea = detailSection.querySelector('textarea');
            if (textarea) {
                treatmentDetails[treatmentType] = textarea.value;
            }
        }
    });

    return {
        shortTermGoals: document.getElementById('short-term-goals')?.value || '',
        longTermGoals: document.getElementById('long-term-goals')?.value || '',
        treatmentMethods: selectedMethods,
        treatmentDetails: treatmentDetails,
        treatmentNotes: document.getElementById('treatment-notes')?.value || '',
        homeExercise: document.getElementById('home-exercise')?.value || ''
    };
}

// 思考データの取得
function getThinkingData() {
    const answers = {};
    document.querySelectorAll('.answer-input').forEach((input, index) => {
        answers[`question${index + 1}`] = input.value;
    });
    return answers;
}

// 評価データの読み込み
function loadEvaluationData(data) {
    if (!data) return;
    
    if (document.getElementById('patient-name')) document.getElementById('patient-name').value = data.patientName || '';
    if (document.getElementById('patient-age')) document.getElementById('patient-age').value = data.patientAge || '';
    if (document.getElementById('diagnosis')) document.getElementById('diagnosis').value = data.diagnosis || '';
    if (document.getElementById('chief-complaint')) document.getElementById('chief-complaint').value = data.chiefComplaint || '';
    if (document.getElementById('medical-history')) document.getElementById('medical-history').value = data.medicalHistory || '';
    if (document.getElementById('current-condition')) document.getElementById('current-condition').value = data.currentCondition || '';
    if (document.getElementById('cognitive-assessment')) document.getElementById('cognitive-assessment').value = data.cognitiveAssessment || '';
    if (document.getElementById('muscle-strength')) document.getElementById('muscle-strength').value = data.muscleStrength || '';
    if (document.getElementById('range-of-motion')) document.getElementById('range-of-motion').value = data.rangeOfMotion || '';
    if (document.getElementById('balance-assessment')) document.getElementById('balance-assessment').value = data.balanceAssessment || '';
    if (document.getElementById('sensory-assessment')) document.getElementById('sensory-assessment').value = data.sensoryAssessment || '';
    
    // ADLデータの読み込み
    if (data.adlData) {
        const adlSelects = document.querySelectorAll('.adl-select');
        adlSelects.forEach((select, index) => {
            const label = select.parentElement.querySelector('label').textContent;
            if (data.adlData[label]) {
                select.value = data.adlData[label];
            }
        });
    }
}

// 治療データの読み込み
function loadTreatmentData(data) {
    if (!data) return;
    
    if (document.getElementById('short-term-goals')) document.getElementById('short-term-goals').value = data.shortTermGoals || '';
    if (document.getElementById('long-term-goals')) document.getElementById('long-term-goals').value = data.longTermGoals || '';
    if (document.getElementById('treatment-notes')) document.getElementById('treatment-notes').value = data.treatmentNotes || '';
    if (document.getElementById('home-exercise')) document.getElementById('home-exercise').value = data.homeExercise || '';
    
    // 治療方法のチェックボックス復元
    if (data.treatmentMethods) {
        document.querySelectorAll('.treatment-methods input[type="checkbox"]').forEach(checkbox => {
            const wasChecked = data.treatmentMethods.includes(checkbox.value);
            checkbox.checked = wasChecked;
            
            // チェックされていた場合は詳細セクションを表示
            if (wasChecked) {
                const treatmentType = checkbox.getAttribute('data-treatment');
                const detailSection = document.getElementById(`${treatmentType}-details`);
                if (detailSection) {
                    detailSection.style.display = 'block';
                }
            }
        });
    }
    
    // 治療詳細の復元
    if (data.treatmentDetails) {
        Object.entries(data.treatmentDetails).forEach(([treatmentType, details]) => {
            const detailSection = document.getElementById(`${treatmentType}-details`);
            if (detailSection) {
                const textarea = detailSection.querySelector('textarea');
                if (textarea) {
                    textarea.value = details;
                }
            }
        });
    }
}

// 思考データの読み込み
function loadThinkingData(data) {
    if (!data) return;
    
    document.querySelectorAll('.answer-input').forEach((input, index) => {
        const key = `question${index + 1}`;
        if (data[key]) {
            input.value = data[key];
        }
    });
}

// 評価保存ボタン
function saveEvaluation() {
    const data = getEvaluationData();
    patientData.evaluation = data;
    saveToLocalStorage();
    showSuccessMessage('評価データを保存しました');
}

// 治療記録保存ボタン
function saveTreatment() {
    const data = getTreatmentData();
    patientData.treatment = data;
    saveToLocalStorage();
    showSuccessMessage('治療記録を保存しました');
}

// 思考記録保存ボタン
function saveThinking() {
    const data = getThinkingData();
    patientData.thinking = data;
    saveToLocalStorage();
    showSuccessMessage('思考記録を保存しました');
}

// レポート生成機能
function generateReport() {
    if (patientManagement.patients.length === 0) {
        showErrorMessage('患者データがありません');
        return;
    }
    
    const currentPatient = patientManagement.patients[patientManagement.currentPatientIndex];
    const evaluationData = currentPatient.data.evaluation || {};
    const treatmentData = currentPatient.data.treatment || {};
    const thinkingData = currentPatient.data.thinking || {};
    
    // 患者情報セクション
    const patientInfoSection = document.getElementById('patient-info-section');
    if (patientInfoSection) {
        patientInfoSection.innerHTML = `
            <h4>患者基本情報</h4>
            <p><strong>患者名:</strong> ${evaluationData.name || '未入力'}</p>
            <p><strong>年齢:</strong> ${evaluationData.age || '未入力'}歳</p>
            <p><strong>診断名:</strong> ${evaluationData.diagnosis || '未入力'}</p>
            <p><strong>主訴:</strong> ${evaluationData.chiefComplaint || '未入力'}</p>
            <p><strong>既往歴:</strong> ${evaluationData.medicalHistory || '未入力'}</p>
            <p><strong>現症:</strong> ${evaluationData.currentCondition || '未入力'}</p>
        `;
    }
    
    // 評価結果セクション
    const evaluationSection = document.getElementById('evaluation-section');
    if (evaluationSection) {
        evaluationSection.innerHTML = `
            <h4>評価結果</h4>
            <p><strong>ADL評価:</strong> ${treatmentData.adlAssessment || '未実施'}</p>
            <p><strong>認知機能評価:</strong> ${treatmentData.cognitiveAssessment || '未実施'}</p>
            <p><strong>筋力評価:</strong> ${treatmentData.muscleStrength || '未実施'}</p>
            <p><strong>関節可動域:</strong> ${treatmentData.rangeOfMotion || '未実施'}</p>
            <p><strong>バランス評価:</strong> ${treatmentData.balanceAssessment || '未実施'}</p>
            <p><strong>感覚評価:</strong> ${treatmentData.sensoryAssessment || '未実施'}</p>
        `;
    }
    
    // 治療計画セクション
    const treatmentSection = document.getElementById('treatment-section');
    if (treatmentSection) {
        const treatmentMethods = treatmentData.treatmentMethods || [];
        const treatmentMethodsText = treatmentMethods.length > 0 ? treatmentMethods.join(', ') : '未選択';
        
        treatmentSection.innerHTML = `
            <h4>治療計画</h4>
            <p><strong>短期目標:</strong> ${treatmentData.shortTermGoals || '未設定'}</p>
            <p><strong>長期目標:</strong> ${treatmentData.longTermGoals || '未設定'}</p>
            <p><strong>治療方法:</strong> ${treatmentMethodsText}</p>
            <p><strong>治療記録:</strong> ${treatmentData.treatmentNotes || '未記録'}</p>
            <p><strong>自主訓練:</strong> ${treatmentData.homeExercise || '未指導'}</p>
        `;
    }
    
    // 思考過程セクション
    const thinkingSection = document.getElementById('thinking-section');
    if (thinkingSection) {
        thinkingSection.innerHTML = `
            <h4>思考過程</h4>
            <p><strong>対話履歴:</strong></p>
            <div style="max-height: 200px; overflow-y: auto; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                ${thinkingData.conversationHistory || '対話履歴がありません'}
            </div>
        `;
    }
    
    showSuccessMessage(`${currentPatient.name}のレポートを生成しました`);
}

// PDF出力（簡易版）
function exportReport() {
    const evaluationData = getEvaluationData();
    const treatmentData = getTreatmentData();
    const thinkingData = getThinkingData();

    let reportContent = `
理学療法士実習レポート

【患者情報】
患者名: ${evaluationData.patientName || '未入力'}
年齢: ${evaluationData.patientAge || '未入力'}歳
診断名: ${evaluationData.diagnosis || '未入力'}
主訴: ${evaluationData.chiefComplaint || '未入力'}

【評価結果】
ADL評価: FIM、Barthel Index（詳細は後で追加予定）
認知機能評価: HDS-R、MMSE（詳細は後で追加予定）
筋力: MMT（詳細は後で追加予定）
関節可動域: ROM（詳細は後で追加予定）
バランス評価: TUG、BBS（詳細は後で追加予定）
感覚評価: 感覚検査（詳細は後で追加予定）

【治療計画】
短期目標: ${treatmentData.shortTermGoals || '未入力'}
長期目標: ${treatmentData.longTermGoals || '未入力'}
治療方法: ${treatmentData.treatmentMethods.join(', ') || '未選択'}
${treatmentData.treatmentDetails && Object.keys(treatmentData.treatmentDetails).length > 0 ? 
    '\n治療詳細:\n' + Object.entries(treatmentData.treatmentDetails).map(([type, details]) => {
        const methodNames = {
            'exercise': '運動療法',
            'physical': '物理療法',
            'adl': 'ADL訓練',
            'gait': '歩行訓練',
            'strength': '筋力増強',
            'rom': '関節可動域訓練',
            'balance': 'バランス訓練',
            'breathing': '呼吸訓練'
        };
        return details ? `・${methodNames[type] || type}: ${details}` : '';
    }).filter(text => text).join('\n') : ''}
治療記録: ${treatmentData.treatmentNotes || '未入力'}

【思考過程】
`;

    Object.entries(thinkingData).forEach(([key, value], index) => {
        if (value) {
            const questions = [
                '患者さんの主訴について',
                '問題の原因分析', 
                '評価の優先順位',
                '治療方針の決定',
                '予後予測',
                'リスク管理'
            ];
            reportContent += `${questions[index]}: ${value}\n\n`;
        }
    });

    // テキストファイルとしてダウンロード
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `理学療法士実習レポート_${evaluationData.patientName || '患者'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccessMessage('レポートをダウンロードしました');
}

// データクリア機能を患者管理システムに対応
function clearAllData() {
    if (patientManagement.patients.length === 0) {
        showErrorMessage('患者データがありません');
        return;
    }
    
    if (confirm('現在の患者のデータをすべてクリアしますか？')) {
        const currentPatient = patientManagement.patients[patientManagement.currentPatientIndex];
        currentPatient.data = {
            evaluation: {},
            treatment: {},
            thinking: {}
        };
        
        // フォームをクリア
        const formElements = document.querySelectorAll('input, textarea, select');
        formElements.forEach(element => {
            if (element.type !== 'button' && element.type !== 'submit') {
                element.value = '';
            }
        });
        
        // チェックボックスをクリア
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // 評価コンテンツを非表示
        const assessmentContents = document.querySelectorAll('.assessment-content');
        assessmentContents.forEach(content => {
            content.style.display = 'none';
        });
        
        // 評価ボタンのアクティブ状態をリセット
        const assessmentButtons = document.querySelectorAll('.assessment-btn');
        assessmentButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // 治療詳細セクションを非表示
        const treatmentDetailSections = document.querySelectorAll('.treatment-detail-section');
        treatmentDetailSections.forEach(section => {
            section.style.display = 'none';
        });
        
        savePatientData();
        showSuccessMessage('データをクリアしました');
    }
}

// 成功メッセージ表示
function showSuccessMessage(message) {
    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.display = 'block';

    // メインコンテンツの最初に挿入
    const mainContent = document.querySelector('main');
    mainContent.insertBefore(successDiv, mainContent.firstChild);

    // 3秒後に自動削除
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// エラーメッセージ表示
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    const mainContent = document.querySelector('main');
    mainContent.insertBefore(errorDiv, mainContent.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// キーボードショートカット
document.addEventListener('keydown', function(e) {
    // Ctrl+S で保存
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab.id === 'evaluation') {
            saveEvaluation();
        } else if (activeTab.id === 'treatment') {
            saveTreatment();
        } else if (activeTab.id === 'thinking') {
            saveThinking();
        }
    }
    
    // Ctrl+R でレポート生成
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        generateReport();
    }
});

// ページ離脱時の警告
window.addEventListener('beforeunload', function(e) {
    const hasData = Object.keys(patientData.evaluation).length > 0 || 
                   Object.keys(patientData.treatment).length > 0 || 
                   Object.keys(patientData.thinking).length > 0;
    
    if (hasData) {
        e.preventDefault();
        e.returnValue = '入力中のデータがあります。ページを離れますか？';
        return '入力中のデータがあります。ページを離れますか？';
    }
}); 

// 対話を開始
function startConversation() {
    // 患者情報を取得
    const patientName = document.getElementById('patient-name')?.value || '患者';
    const diagnosis = document.getElementById('diagnosis')?.value || '未設定';
    const chiefComplaint = document.getElementById('chief-complaint')?.value || '未記録';
    
    conversationState = {
        isActive: true,
        currentStep: 0,
        patientInfo: {
            name: patientName,
            diagnosis: diagnosis,
            chiefComplaint: chiefComplaint
        },
        answers: {},
        conversationHistory: []
    };
    
    // UIを更新
    document.querySelector('.conversation-container').style.display = 'block';
    document.querySelector('.start-conversation-btn').style.display = 'none';
    document.querySelector('.save-conversation-btn').style.display = 'inline-block';
    document.querySelector('.end-conversation-btn').style.display = 'inline-block';
    
    // 最初の質問を表示
    addAssistantMessage(`こんにちは！${patientName}さんの思考支援を始めましょう。\n\n診断名: ${diagnosis}\n主訴: ${chiefComplaint}\n\nそれでは、段階的に患者さんの理解を深めていきましょう。`);
    
    setTimeout(() => {
        askNextQuestion();
    }, 1000);
}

// 次の質問を表示
function askNextQuestion() {
    if (conversationState.currentStep >= questionPatterns.evaluation.length + 
        questionPatterns.analysis.length + 
        questionPatterns.planning.length + 
        questionPatterns.prediction.length + 
        questionPatterns.risk.length) {
        endConversation();
        return;
    }
    
    let currentQuestion;
    let stepCount = 0;
    
    // 評価段階
    if (stepCount + questionPatterns.evaluation.length > conversationState.currentStep) {
        currentQuestion = questionPatterns.evaluation[conversationState.currentStep - stepCount];
    } else {
        stepCount += questionPatterns.evaluation.length;
        
        // 分析段階
        if (stepCount + questionPatterns.analysis.length > conversationState.currentStep) {
            currentQuestion = questionPatterns.analysis[conversationState.currentStep - stepCount];
        } else {
            stepCount += questionPatterns.analysis.length;
            
            // 計画段階
            if (stepCount + questionPatterns.planning.length > conversationState.currentStep) {
                currentQuestion = questionPatterns.planning[conversationState.currentStep - stepCount];
            } else {
                stepCount += questionPatterns.planning.length;
                
                // 予測段階
                if (stepCount + questionPatterns.prediction.length > conversationState.currentStep) {
                    currentQuestion = questionPatterns.prediction[conversationState.currentStep - stepCount];
                } else {
                    stepCount += questionPatterns.prediction.length;
                    
                    // リスク管理段階
                    currentQuestion = questionPatterns.risk[conversationState.currentStep - stepCount];
                }
            }
        }
    }
    
    if (currentQuestion) {
        addAssistantMessage(currentQuestion.question);
        conversationState.currentStep++;
    }
}

// ユーザーの回答を送信
function submitAnswer() {
    const answerInput = document.getElementById('user-answer');
    const answer = answerInput.value.trim();
    
    if (!answer) {
        showErrorMessage('回答を入力してください。');
        return;
    }
    
    // ユーザーの回答を表示
    addUserMessage(answer);
    
    // 回答を保存
    conversationState.answers[`answer_${conversationState.currentStep}`] = answer;
    
    // 入力欄をクリア
    answerInput.value = '';
    
    // 次の質問を表示
    setTimeout(() => {
        askNextQuestion();
    }, 500);
}

// アシスタントメッセージを追加
function addAssistantMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">A</div>
        <div class="message-content">
            <div>${message.replace(/\n/g, '<br>')}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 会話履歴に追加
    conversationState.conversationHistory.push({
        type: 'assistant',
        message: message,
        time: time
    });
}

// ユーザーメッセージを追加
function addUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    
    const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div>${message.replace(/\n/g, '<br>')}</div>
            <div class="message-time">${time}</div>
        </div>
        <div class="message-avatar">U</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 会話履歴に追加
    conversationState.conversationHistory.push({
        type: 'user',
        message: message,
        time: time
    });
}

// 対話を終了
function endConversation() {
    addAssistantMessage('思考支援が完了しました！\n\n患者さんの理解が深まりましたか？\n対話内容は保存できますので、後で振り返ることができます。');
    
    conversationState.isActive = false;
    
    // UIを更新
    document.querySelector('.save-conversation-btn').style.display = 'none';
    document.querySelector('.end-conversation-btn').style.display = 'none';
    document.querySelector('.start-conversation-btn').style.display = 'inline-block';
}

// 対話を保存
function saveConversation() {
    if (!conversationState.isActive && conversationState.conversationHistory.length === 0) {
        showErrorMessage('保存する対話がありません。');
        return;
    }
    
    const savedConversations = JSON.parse(localStorage.getItem('conversationHistory') || '[]');
    const conversationData = {
        id: Date.now(),
        date: new Date().toLocaleString('ja-JP'),
        patientInfo: conversationState.patientInfo,
        conversationHistory: conversationState.conversationHistory,
        answers: conversationState.answers
    };
    
    savedConversations.push(conversationData);
    localStorage.setItem('conversationHistory', JSON.stringify(savedConversations));
    
    showSuccessMessage('対話が保存されました！');
    loadConversationHistory();
}

// 対話履歴を読み込み
function loadConversation() {
    loadConversationHistory();
}

// 対話履歴を表示
function loadConversationHistory() {
    const savedConversations = JSON.parse(localStorage.getItem('conversationHistory') || '[]');
    const historyList = document.getElementById('history-list');
    
    if (savedConversations.length === 0) {
        historyList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">保存された対話履歴がありません。</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    savedConversations.reverse().forEach(conversation => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.onclick = () => viewConversation(conversation);
        
        historyItem.innerHTML = `
            <h4>${conversation.patientInfo.name}さん</h4>
            <p>診断名: ${conversation.patientInfo.diagnosis}</p>
            <p>主訴: ${conversation.patientInfo.chiefComplaint}</p>
            <p class="history-date">${conversation.date}</p>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// 保存された対話を表示
function viewConversation(conversation) {
    // チャット画面をクリア
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // 保存された対話を表示
    conversation.conversationHistory.forEach(msg => {
        if (msg.type === 'assistant') {
            addAssistantMessage(msg.message);
        } else {
            addUserMessage(msg.message);
        }
    });
    
    // 対話状態を更新
    conversationState = {
        isActive: false,
        currentStep: 0,
        patientInfo: conversation.patientInfo,
        answers: conversation.answers,
        conversationHistory: conversation.conversationHistory
    };
    
    // UIを更新
    document.querySelector('.conversation-container').style.display = 'block';
    document.querySelector('.start-conversation-btn').style.display = 'none';
    document.querySelector('.save-conversation-btn').style.display = 'none';
    document.querySelector('.end-conversation-btn').style.display = 'none';
    
    showSuccessMessage('対話履歴を表示しました。');
} 

// 対話履歴を削除
function clearConversationHistory() {
    if (confirm('すべての対話履歴を削除しますか？この操作は元に戻せません。')) {
        // ローカルストレージから履歴を削除
        localStorage.removeItem('conversationHistory');
        
        // 履歴リストをクリア
        const historyList = document.getElementById('history-list');
        if (historyList) {
            historyList.innerHTML = '';
        }
        
        // グローバル変数の履歴もクリア
        conversationState.conversationHistory = [];
        
        showSuccessMessage('対話履歴を削除しました');
    }
} 