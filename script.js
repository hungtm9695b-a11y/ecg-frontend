document.getElementById("analyzeBtn").addEventListener("click", async () => {

    // === CHỈ SỬA 1 DÒNG NÀY ===
    const BACKEND_URL = "https://ecg-backend-229625116536.asia-southeast1.run.app/analyze";

    const fileInput = document.getElementById("ecg");
    const loadingDiv = document.getElementById("loading");
    const resultBox = document.getElementById("resultBox");

    if (!fileInput || fileInput.files.length === 0) {
        alert("Vui lòng chọn ảnh ECG!");
        return;
    }

    let formData = new FormData();
    formData.append("ecg_image", fileInput.files[0]);

    // Thông tin bệnh nhân
    formData.append("age", document.getElementById("age").value || "");
    formData.append("sex", document.getElementById("sex").value || "");

    // Sinh hiệu
    let vitals = `HR:${document.getElementById("hr").value}, BP:${document.getElementById("bp").value}, SpO2:${document.getElementById("spo2").value}`;
    formData.append("vitals", vitals);

    // Triệu chứng
    let symptoms = [];
    document.querySelectorAll('.symptom:checked').forEach(cb => symptoms.push(cb.value));
    formData.append("symptoms", symptoms.join(", "));

    // Yếu tố nguy cơ
    let risks = [];
    document.querySelectorAll('.risk:checked').forEach(cb => risks.push(cb.value));
    formData.append("risks", risks.join(", "));

    // HEAR Score input
    formData.append("hear", document.getElementById("hear_score_input")?.value || "");

    loadingDiv.style.display = "block";
    resultBox.style.display = "none";

    try {
        let response = await fetch(BACKEND_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Lỗi server: " + response.status);

        let result = await response.json();

        loadingDiv.style.display = "none";
        resultBox.style.display = "block";

        // --- PHÂN TÍCH ECG ---
        setText("ecg_phan_tich", result.ecg_phan_tich);
        setText("ketluan_ecg", result.ket_luan_ecg);

        // --- RỐI LOẠN NHỊP ---
        if (result.roi_loan_nhip && result.roi_loan_nhip.length > 2) {
            document.getElementById("roi_loan_nhip_block").style.display = "block";
            setText("roi_loan_nhip", result.roi_loan_nhip);
        } else {
            document.getElementById("roi_loan_nhip_block").style.display = "none";
        }

        // --- ICON NGUY CƠ ---
        let mucNguyCo = (result.muc_nguy_co || "").trim();
        let iconBox = document.getElementById("riskIcon");
        let riskText = document.getElementById("muc_nguy_co");

        iconBox.className = "risk-icon-box"; // reset
        riskText.innerText = mucNguyCo || "";

        if (mucNguyCo.includes("Cao")) iconBox.classList.add("risk-high");
        else if (mucNguyCo.includes("Trung")) iconBox.classList.add("risk-medium");
        else iconBox.classList.add("risk-low");

        // --- HEAR SCORE ---
        let hearText = result.hear_score_text;
        if (!hearText || hearText.trim() === "") {
            hearText = "Không cung cấp";
        }
        setText("hear_score", hearText);

        // --- CHẨN ĐOÁN GỢI Ý ---
        setText("chandoan_goiy", result.chan_doan_goi_y);

        // --- KHUYẾN CÁO ---
        let ul = document.getElementById("khuyen_cao");
        ul.innerHTML = "";

        let list = Array.isArray(result.khuyen_cao) ? result.khuyen_cao : [result.khuyen_cao];

        list.forEach(item => {
            if (item) {
                let li = document.createElement("li");
                li.innerText = item;
                ul.appendChild(li);
            }
        });

        // --- AUTO SCROLL TO RESULT ---
        setTimeout(() => {
            resultBox.scrollIntoView({ behavior: "smooth" });
        }, 200);

    } catch (err) {
        loadingDiv.style.display = "none";
        alert("Lỗi: " + err.message);
    }
});

function setText(id, text) {
    let el = document.getElementById(id);
    if (el) el.innerText = text || "";
}
