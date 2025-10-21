const { NlpManager } = require('node-nlp');

async function trainModel() {
    console.log("🤖 Memulai training model NLP...");
    const manager = new NlpManager({ languages: ['id'], forceNER: true });

    // 1. Menambahkan data training untuk setiap 'intent'
    
    // Sapaan
    manager.addDocument('id', 'halo', 'greetings.hello');
    manager.addDocument('id', 'hai', 'greetings.hello');
    manager.addDocument('id', 'selamat pagi', 'greetings.hello');

    // Perpisahan & Terima Kasih
    manager.addDocument('id', 'terima kasih', 'greetings.thanks');
    manager.addDocument('id', 'makasih ya', 'greetings.thanks');
    manager.addDocument('id', 'sampai jumpa', 'greetings.bye');
    manager.addDocument('id', 'dadah', 'greetings.bye');

    // Tanya tentang Dana Darurat
    manager.addDocument('id', 'apa itu dana darurat', 'about.emergency_fund');
    manager.addDocument('id', 'jelaskan tentang dana darurat', 'about.emergency_fund');
    manager.addDocument('id', 'berapa dana darurat yang ideal', 'about.emergency_fund');

    // Tanya tentang Investasi
    manager.addDocument('id', 'bagaimana cara investasi', 'about.investment');
    manager.addDocument('id', 'investasi untuk pemula', 'about.investment');
    manager.addDocument('id', 'jelaskan tentang investasi', 'about.investment');

    // Tanya tentang Utang
    manager.addDocument('id', 'cara mengatasi utang', 'about.debt');
    manager.addDocument('id', 'apa itu utang produktif', 'about.debt');
    manager.addDocument('id', 'bagaimana mengelola cicilan', 'about.debt');

    // Tanya tentang Anggaran
    manager.addDocument('id', 'cara membuat anggaran', 'about.budget');
    manager.addDocument('id', 'apa itu metode 50/30/20', 'about.budget');
    manager.addDocument('id', 'bagaimana cara menghemat', 'about.budget');


    // 2. Menambahkan jawaban untuk setiap 'intent'
    manager.addAnswer('id', 'greetings.hello', 'Halo! Ada yang bisa saya bantu seputar keuangan?');
    manager.addAnswer('id', 'greetings.thanks', 'Sama-sama! Senang bisa membantu Anda.');
    manager.addAnswer('id', 'greetings.bye', 'Sampai jumpa lagi!');
    
    manager.addAnswer('id', 'about.emergency_fund', 'Dana darurat adalah dana simpanan khusus untuk kondisi tak terduga. Idealnya, Anda punya 3-6 kali pengeluaran bulanan. Mulailah menyisihkan sedikit demi sedikit ke rekening terpisah.');
    manager.addAnswer('id', 'about.investment', 'Investasi adalah cara menumbuhkan uang. Untuk pemula, Reksadana bisa jadi pilihan bagus karena risikonya lebih terkendali. Pastikan cash flow Anda sudah positif sebelum berinvestasi ya.');
    manager.addAnswer('id', 'about.debt', 'Jika Anda punya utang, fokuslah untuk melunasi yang bunganya paling tinggi terlebih dahulu. Hindari menambah utang konsumtif baru sampai kondisi keuangan stabil.');
    manager.addAnswer('id', 'about.budget', 'Anggaran adalah kunci mengontrol keuangan. Coba metode 50/30/20: 50% pendapatan untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan/utang.');

    // 3. Melatih model dan menyimpannya
    await manager.train();
    manager.save('./model.nlp'); // Menyimpan model ke file
    console.log("✅ Model selesai dilatih dan disimpan sebagai model.nlp");
}

trainModel();