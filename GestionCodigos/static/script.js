document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("barcode-form");
    const exportExcelButton = document.getElementById("export-excel");

    // Manejar el formulario de registro
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const code = document.getElementById("barcode").value;
        const location = document.getElementById("location").value;
        const response = await fetch("/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, location })
        });
        if (response.ok) {
            alert("Código registrado con éxito");
            form.reset();
            loadRegisteredProducts(); // Actualizar la lista de productos registrados
        } else {
            alert("Error al registrar el código");
        }
    });

    // Manejar la exportación a Excel
    exportExcelButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/export/excel");
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "data.xlsx";
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Error al exportar a Excel");
            }
        } catch (error) {
            console.error("Error al exportar a Excel:", error);
        }
    });

    // Cargar los productos registrados en el componente scrollable
    const loadRegisteredProducts = async () => {
        const response = await fetch("/data");
        if (response.ok) {
            const data = await response.json();
            renderRegisteredProducts(data.reverse()); // Mostrar los últimos cargados primero
        } else {
            console.error("Error al cargar los productos registrados");
        }
    };

    // Renderizar los productos en el componente scrollable
    const renderRegisteredProducts = (products) => {
        const registeredContainer = document.getElementById("registered-products-body");
        registeredContainer.innerHTML = ""; // Limpiar el contenedor
        products.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product["Código de Barra"]}</td>
                <td>${product["Ubicación"]}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-delete" data-code="${product["Código de Barra"]}">
                        Eliminar
                    </button>
                </td>
            `;
            registeredContainer.appendChild(row);
        });

        // Asignar eventos a los botones de eliminar
        document.querySelectorAll(".btn-delete").forEach(button => {
            button.addEventListener("click", async () => {
                const code = button.getAttribute("data-code");
                if (confirm(`¿Estás seguro de eliminar el código: ${code}?`)) {
                    const response = await fetch("/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code })
                    });
                    if (response.ok) {
                        alert("Código eliminado");
                        loadRegisteredProducts(); // Actualizar la lista después de eliminar
                    } else {
                        alert("Error al eliminar el código");
                    }
                }
            });
        });
    };

    loadRegisteredProducts(); // Cargar los productos al iniciar
});