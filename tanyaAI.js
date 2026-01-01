async function tanyaAI() {
    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "deepseek-r1",  // Sesuaikan dengan model yang kamu install tadi
            prompt: "Buatkan saya pantun tentang koding java",
            stream: false          // false = nunggu selesai baru jawab, true = ngetik satu-satu
        })
    });

    const data = await response.json();
    console.log("Jawaban AI:", data.response);
    alert(data.response);
}

tanyaAI();
