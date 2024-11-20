document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#dataTable tbody");
    const addItemButton = document.getElementById("addItem");
    const importExcel = document.getElementById("importExcel");
    const generatePDF = document.getElementById("generatePDF");
    const itemModal = new bootstrap.Modal(document.getElementById("itemModal"));
    const itemNameInput = document.getElementById("itemName");
    const itemPriceInput = document.getElementById("itemPrice");
    const itemForm = document.getElementById("itemForm");
    const data = [];
    let filename;

    let editIndex = null;

    // Render Table
    const renderTable = (data) => {
        const tableBody = document.querySelector("#dataTable tbody");
        tableBody.innerHTML = ""; // Bersihkan tabel
    
        data.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>
                    <button class="btn btn-warning btn-sm editItem" data-index="${index}">Edit</button>
                    <button class="btn btn-danger btn-sm deleteItem" data-index="${index}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };
    

    // Add/Edit Item
    itemForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = itemNameInput.value;
        const price = itemPriceInput.value;

        if (editIndex !== null) {
            data[editIndex] = { name, price };
            editIndex = null;
        } else {
            data.push({ name, price });
        }

        itemForm.reset();
        itemModal.hide();
        renderTable();
    });

    // Add Item Button
    addItemButton.addEventListener("click", () => {
        editIndex = null;
        itemForm.reset();
        itemModal.show();
    });

    // Import Excel
    importExcel.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("File selected:", file.name);
            filename = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                console.log("File reading completed");
                try {
                    const workbook = XLSX.read(event.target.result, { type: "binary" });
                    console.log("Workbook loaded:", workbook);
    
                    const sheetName = workbook.SheetNames[0];
                    console.log("Sheet name:", sheetName);
    
                    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    console.log("Sheet data:", sheetData);
    
                    // Transformasi data dari Excel menjadi array objek
                    sheetData.forEach((row, index) => {
                        console.log(`Processing row ${index + 1}:`, row);
                        if (row["Nama Item"] && row["Harga"]) {
                            data.push({ name: row["Nama Item"], price: row["Harga"] });
                            console.log(`Added to data array: Name = ${row["Nama Item"]}, Price = ${row["Harga"]}`);
                        } else {
                            console.warn(`Row ${index + 1} skipped: Incomplete data`, row);
                        }
                    });
    
                    // Render tabel setelah data diperbarui
                    console.log("Rendering table with data:", data);
                    renderTable(data);
                } catch (error) {
                    console.error("Error processing file:", error);
                }
            };
    
            reader.onerror = (err) => {
                console.error("Error reading file:", err);
            };
    
            console.log("Starting file read");
            reader.readAsBinaryString(file);
        } else {
            console.log("Tidak ada file yang diunggah");
        }
    });
    
    
    


    // Edit/Delete Actions
    tableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("editItem")) {
            const index = e.target.dataset.index;
            const item = data[index];
            itemNameInput.value = item.name;
            itemPriceInput.value = item.price;
            editIndex = index;
            itemModal.show();
        } else if (e.target.classList.contains("deleteItem")) {
            const index = e.target.dataset.index;
            data.splice(index, 1);
            renderTable(data);
        }
    });
    

    // Generate PDF
    generatePDF.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("landscape", "mm", [325, 210]);
        const background = "background.jpg";
        let bg_w = 108.3, bg_h = 105;
        let name_x = 69,name_y=36; 
        let price_x=101.2,price_y=80.3;

        let x = 0, y = 0;

        data.forEach((item, index) => {
            // Jika index data habis dibagi 6 (misal 6,12,18 dst) maka tambah halaman baru
            if (index % 6 === 0 && index !== 0) {
                pdf.addPage();
                x = 0, y = 0;
            }

            // Set background
            pdf.addImage(background, "JPEG", x, y, bg_w, bg_h);

            // Set Teks Merk
            pdf.setFont("Helvetica", "bold"); 
            pdf.setTextColor('black');
            pdf.setFontSize(28);
            pdf.text(item.name, x + name_x, y + name_y,'center');

            // Set Teks Submerk
            pdf.setFont("Helvetica", "bold"); 
            pdf.setTextColor('black');
            pdf.setFontSize(28);
            pdf.text(item.name, x + name_x, y + name_y,'center');
            // Set Teks Volume
            // Set Teks Jual
            // Set Garis Coret 

            // Set Teks Promo
            pdf.setFontSize(49);
            pdf.setTextColor('red');
            pdf.text(`${item.price}`, x + price_x, y + price_y,'right');

            // Set Teks Periode

            // Jika index+1 data habis dibagi 3, maka reset x dan, y pindah p
            if ((index + 1) % 3 === 0) {
                x = 0;
                y += bg_h;
            // Jika index+1 data tidak habis dibagi 3, maka reset x dan, y turun
            } else {
                x += bg_w;
            }
        });

        pdf.save(filename+".pdf");
    });
});
