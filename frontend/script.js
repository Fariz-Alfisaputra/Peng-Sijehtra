document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api/analyze';

    // Elements
    const homeSection = document.getElementById('home-section');
    const questionnaireSection = document.getElementById('questionnaire-section');
    const resultSection = document.getElementById('result-section');
    const startTestBtn = document.getElementById('start-test-btn');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const questionContent = document.getElementById('question-content');
    const progressBarFill = document.getElementById('progress-bar-fill');
    
    // Elemen Modal
    const confirmModalBackdrop = document.getElementById('confirm-modal-backdrop');
    const modalBtnYes = document.getElementById('modal-btn-yes');
    const modalBtnNo = document.getElementById('modal-btn-no');

    // --- PENAMBAHAN BARU: Variabel untuk menyimpan tujuan navigasi ---
    let navigationTargetUrl = null;

    // Data Store
    const formData = {};
    let currentStep = 0;
    const questions = [
        {
            title: "Berapa penghasilanmu setiap bulannya?",
            fields: [{ id: 'monthly_income', label: 'Gaji Bulanan (setelah pajak)' }, { id: 'passive_income', label: 'Pendapatan Pasif (investasi, dll)' }]
        },
        {
            title: "Bagaimana alokasi pengeluaran bulananmu?",
            fields: [{ id: 'monthly_needs', label: 'Kebutuhan Pokok (makan, transport, tagihan)' }, { id: 'monthly_wants', label: 'Keinginan (hiburan, hobi, makan di luar)' }]
        },
        {
            title: "Berapa total aset yang kamu miliki?",
            fields: [{ id: 'savings', label: 'Tabungan & Dana Darurat' }, { id: 'investments', label: 'Nilai Investasi (saham, reksa dana)' }]
        },
        {
            title: "Apakah kamu memiliki utang?",
            fields: [{ id: 'total_debt', label: 'Total Utang (KPR, kendaraan, pinjol)' }, { id: 'monthly_installment', label: 'Total Cicilan per Bulan' }]
        }
    ];

    const beforeUnloadHandler = (event) => { event.preventDefault(); event.returnValue = ''; };
    function activateLeaveWarning() { window.addEventListener('beforeunload', beforeUnloadHandler); }
    function deactivateLeaveWarning() { window.removeEventListener('beforeunload', beforeUnloadHandler); }

    // Fungsi lainnya tetap sama (tidak berubah)
    function formatRupiah(angka) { if (!angka) return ''; let number_string = angka.toString().replace(/[^,\d]/g, ''); return number_string.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
    function unformatRupiah(rupiah) { if (!rupiah) return '0'; return rupiah.toString().replace(/\./g, ''); }
    function showStep(step) { if (step > 0) { questions[step - 1].fields.forEach(field => { const inputElement = document.getElementById(field.id); if (inputElement) formData[field.id] = unformatRupiah(inputElement.value); }); } const currentQuestion = questions[step]; let html = `<div class="question-step"><h2>${currentQuestion.title}</h2>`; currentQuestion.fields.forEach(field => { const value = formatRupiah(formData[field.id]); html += `<div class="form-group"><label for="${field.id}">${field.label}</label><input type="text" inputmode="numeric" id="${field.id}" placeholder="0" value="${value}" required></div>`; }); html += `</div>`; questionContent.innerHTML = html; updateButtons(step); updateProgressBar(step); }
    function updateButtons(step) { if (!prevBtn || !nextBtn) return; prevBtn.style.display = step === 0 ? 'none' : 'inline-block'; nextBtn.textContent = step === questions.length - 1 ? 'Lihat Hasil Analisis' : 'Selanjutnya'; }
    function updateProgressBar(step) { if (!progressBarFill) return; const progress = ((step + 1) / questions.length) * 100; progressBarFill.style.width = `${progress}%`; }
    async function submitForm() { deactivateLeaveWarning(); questions[currentStep].fields.forEach(field => { formData[field.id] = unformatRupiah(document.getElementById(field.id).value); }); nextBtn.disabled = true; nextBtn.textContent = 'Menganalisis...'; try { const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const result = await response.json(); displayResults(result); } catch (error) { console.error('Error submitting form:', error); alert('Gagal mendapatkan hasil analisis. Pastikan server backend berjalan dan coba lagi.'); } finally { nextBtn.disabled = false; updateButtons(currentStep); } }
    function displayResults(result) { document.getElementById('financial-score').textContent = result.score; const classificationEl = document.getElementById('financial-classification'); classificationEl.textContent = result.classification; classificationEl.className = ''; classificationEl.classList.add(result.classification.toLowerCase().replace(' ', '-')); document.getElementById('financial-recommendation').textContent = result.recommendation; document.getElementById('saving-ratio').textContent = `${result.ratios.savingRatio.toFixed(1)}%`; document.getElementById('debt-ratio').textContent = `${result.ratios.debtRatio.toFixed(1)}%`; document.getElementById('emergency-fund-status').textContent = result.ratios.emergencyFundStatus; questionnaireSection.style.display = 'none'; resultSection.style.display = 'block'; window.scrollTo(0, 0); }
    window.showHome = (isReset = false) => { if(resultSection) resultSection.style.display = 'none'; if(questionnaireSection) questionnaireSection.style.display = 'none'; if(homeSection) homeSection.style.display = 'block'; window.scrollTo(0, 0); if (isReset) { for (const key in formData) { delete formData[key]; } currentStep = 0; } };

    // Event Listeners
    if (startTestBtn) {
        startTestBtn.addEventListener('click', () => {
            homeSection.style.display = 'none';
            questionnaireSection.style.display = 'block';
            currentStep = 0;
            showStep(currentStep);
            activateLeaveWarning();
        });

        // Logika Tombol Batal Tes (tidak berubah)
        cancelBtn.addEventListener('click', () => {
            confirmModalBackdrop.classList.remove('hidden');
        });

        // Logika Tombol Modal "Ya" (DIPERBARUI)
        modalBtnYes.addEventListener('click', () => {
            deactivateLeaveWarning(); // Matikan penjaga browser
            
            if (navigationTargetUrl) {
                // Jika user tadinya mau klik link, arahkan ke sana
                window.location.href = navigationTargetUrl;
            } else {
                // Jika user klik "Batalkan Tes", kembali ke home
                showHome(true);
            }
            
            navigationTargetUrl = null; // Reset
            confirmModalBackdrop.classList.add('hidden'); // Tutup modal
        });

        // Logika Tombol Modal "Tidak" (DIPERBARUI)
        modalBtnNo.addEventListener('click', () => {
            navigationTargetUrl = null; // Reset
            confirmModalBackdrop.classList.add('hidden');
        });
        
        // Menutup modal jika klik di luar (DIPERBARUI)
        confirmModalBackdrop.addEventListener('click', (e) => {
            if (e.target === confirmModalBackdrop) {
                navigationTargetUrl = null; // Reset
                confirmModalBackdrop.classList.add('hidden');
            }
        });

        // --- PENAMBAHAN BARU: Mencegat klik pada link navigasi ---
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Cek apakah kuesioner sedang aktif
                const isQuestionnaireActive = questionnaireSection && !questionnaireSection.classList.contains('hidden');

                if (isQuestionnaireActive) {
                    e.preventDefault(); // Hentikan navigasi standar
                    navigationTargetUrl = e.currentTarget.href; // Simpan URL tujuan
                    confirmModalBackdrop.classList.remove('hidden'); // Tampilkan modal kustom
                }
            });
        });
        // --- AKHIR PENAMBAHAN BARU ---

        // Event listener lainnya (tidak berubah)
        nextBtn.addEventListener('click', () => { if (currentStep < questions.length - 1) { currentStep++; showStep(currentStep); } else { submitForm(); } });
        prevBtn.addEventListener('click', () => { if (currentStep > 0) { currentStep--; showStep(currentStep); } });
        questionContent.addEventListener('input', (e) => { if (e.target.tagName === 'INPUT' && e.target.type === 'text') { const { value } = e.target; e.target.value = formatRupiah(value); } });
    }
});