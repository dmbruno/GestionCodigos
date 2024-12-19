document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("barcode-form");
    const exportExcelButton = document.getElementById("export-excel");
    const deleteAllButton = document.getElementById("delete-all");

    // Manejar el formulario de registro
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const code = document.getElementById("barcode").value;
        const location = document.getElementById("location").value;
        const product = document.getElementById("product").value;
        const brand = document.getElementById("brand").value;
        const stock = document.getElementById("stock").value || 0; // Si está vacío, asignar 0

        const response = await fetch("/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, location, product, brand, stock })
        });
        if (response.ok) {
            alert("Producto registrado con éxito");
            form.reset();
            loadRegisteredProducts(); // Actualizar la lista de productos registrados
            document.getElementById("barcode").focus();
        } else {
            alert("Error al registrar el producto");
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

    // Manejar la eliminación de todos los registros
    deleteAllButton.addEventListener("click", async () => {
        if (confirm("¿Estás seguro de eliminar todos los registros?")) {
            try {
                const response = await fetch("/delete-all", {
                    method: "POST"
                });
                if (response.ok) {
                    alert("Todos los registros han sido eliminados");
                    loadRegisteredProducts(); // Actualizar la lista de productos registrados
                } else {
                    alert("Error al eliminar los registros");
                }
            } catch (error) {
                console.error("Error al eliminar todos los registros:", error);
            }
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
                <td class="text-center">${product["Código de Barra"] || ""}</td>
                <td class="text-center">${product["Ubicación"] || ""}</td>
                <td class="text-center">${product["Producto"] || ""}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-danger btn-delete" data-code="${product["Código de Barra"]}">
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
                if (confirm(`¿Estás seguro de eliminar el producto con código: ${code}?`)) {
                    const response = await fetch("/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code })
                    });
                    if (response.ok) {
                        alert("Producto eliminado");
                        loadRegisteredProducts(); // Actualizar la lista después de eliminar
                    } else {
                        alert("Error al eliminar el producto");
                    }
                }
            });
        });
    };

    loadRegisteredProducts(); // Cargar los productos al iniciar
});