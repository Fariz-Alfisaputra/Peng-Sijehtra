const express = require('express');
const cors = require('cors');
const { NlpManager } = require('node-nlp');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Setup NLP Manager ---
const manager = new NlpManager({ languages: ['id'] });
const modelFile = './model.nlp';

// Memuat model NLP yang sudah dilatih
if (fs.existsSync(modelFile)) {
    manager.load(modelFile);
    console.log("✅ Model NLP berhasil dimuat.");
} else {
    console.error("❌ File model.nlp tidak ditemukan! Harap jalankan 'node train-nlp.js' terlebih dahulu.");
}


// --- API Endpoints ---

// Endpoint untuk Analisis Finansial (tidak berubah)
app.post('/api/analyze', (req, res) => {
    // ... (Logika fungsi analyzeFinancialHealth tetap sama seperti sebelumnya)
    // ... (Anda bisa copy-paste fungsi analyzeFinancialHealth dari kode lama ke sini)
    function analyzeFinancialHealth(data) {
        const inputs = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, parseInt(value || 0)]));
        const { monthly_income, passive_income, monthly_needs, monthly_wants, savings, investments, total_debt, monthly_installment } = inputs;
        const totalIncome = monthly_income + passive_income;
        const totalExpenses = monthly_needs + monthly_wants;
        const monthlyNetFlow = totalIncome - totalExpenses;
        const savingRatio = totalIncome > 0 ? (monthlyNetFlow / totalIncome) * 100 : 0;
        const debtRatio = totalIncome > 0 ? (monthly_installment / totalIncome) * 100 : 0;
        let emergencyFundStatus = "Kurang";
        const emergencyFundIdeal = monthly_needs * 3;
        if (savings >= emergencyFundIdeal) emergencyFundStatus = "Ideal";
        else if (savings >= monthly_needs) emergencyFundStatus = "Cukup";
        let score = 0;
        if (savingRatio >= 20) score += 40; else if (savingRatio >= 10) score += 25; else if (savingRatio > 0) score += 10;
        if (debtRatio === 0) score += 35; else if (debtRatio <= 35) score += 35; else if (debtRatio <= 45) score += 15;
        if (emergencyFundStatus === "Ideal") score += 25; else if (emergencyFundStatus === "Cukup") score += 15; else if (savings > 0) score += 5;
        score = Math.round(score);
        let classification = "Perlu Perbaikan"; let recommendation = "";
        if (score > 75) { classification = "Sehat"; recommendation = "Kondisi keuanganmu sangat baik! Pertahankan kebiasaan menabung dan pertimbangkan untuk meningkatkan alokasi investasi."; }
        else if (score > 50) { classification = "Cukup Sehat"; recommendation = "Sudah cukup baik, namun ada ruang untuk perbaikan. Coba tinjau kembali 'pengeluaran keinginan' dan fokus menambah dana darurat."; }
        else { classification = "Perlu Perbaikan"; recommendation = "Kondisi keuanganmu perlu perhatian serius. Prioritas utama adalah menekan pengeluaran yang tidak perlu dan mengurangi utang."; }
        return { score, classification, recommendation, ratios: { savingRatio, debtRatio, emergencyFundStatus } };
    }
    const analysisResult = analyzeFinancialHealth(req.body);
    res.json(analysisResult);
});

// Endpoint BARU untuk Chatbot AI
app.post('/api/chatbot', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ answer: "Pesan tidak boleh kosong." });
    }

    try {
        const response = await manager.process('id', message);
        const answer = response.answer || "Maaf, saya belum mengerti pertanyaan itu. Coba tanyakan hal lain seputar keuangan pribadi.";
        res.json({ answer });
    } catch (error) {
        console.error("Error saat memproses NLP:", error);
        res.status(500).json({ answer: "Maaf, terjadi kesalahan pada sistem AI kami." });
    }
});


app.listen(port, () => {
    console.log(`✅ Server PengSijehtra berjalan di http://localhost:${port}`);
});