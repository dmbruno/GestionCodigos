document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("data-table");
    const searchBar = document.getElementById("search-bar");

    let allData = []; // Almacenará todos los datos para búsqueda y edición

    // Cargar los datos desde el backend
    const loadTable = async () => {
        try {
            const response = await fetch("/data");
            if (response.ok) {
                const data = await response.json();
                allData = data; // Guardar todos los datos
                renderTable(data);
            } else {
                alert("Error al cargar los datos");
            }
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
        }
    };

    // Renderizar la tabla con los datos
    const renderTable = (data) => {
        table.innerHTML = ""; // Limpiar la tabla
        if (data.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan="6" class="text-center">No se encontraron registros</td>
            `;
            table.appendChild(row);
        } else {
            data.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item["Código de Barra"]}</td>
                    <td>${item["Ubicación"]}</td>
                    <td>${item["Producto"]}</td>
                    <td>${item["Marca"]}</td>
                    <td>${item["Stock"] || "0"}</td>
                    <td>
                        <div class="d-flex">
                            <button class="btn btn-edit me-2" data-code="${item["Código de Barra"]}">Edit</button>
                            <button class="btn btn-delete" data-code="${item["Código de Barra"]}">Delete</button>
                        </div>
                    </td>
                `;
                table.appendChild(row);
            });
        }

        attachButtonEvents(); // Reasignar eventos después de renderizar la tabla
    };

    // Asignar eventos a los botones de editar y eliminar
    const attachButtonEvents = () => {
        document.querySelectorAll(".btn-edit").forEach(button => {
            button.addEventListener("click", async () => {
                const code = button.getAttribute("data-code");
                if (!code) {
                    alert("Código no encontrado.");
                    return;
                }

                const newLocation = prompt("Ingresa la nueva ubicación para el código: " + code);
                const newProduct = prompt("Ingresa el nuevo producto:");
                const newBrand = prompt("Ingresa la nueva marca:");
                let newStock = prompt("Ingresa el nuevo stock:");

                if (newLocation && newProduct && newBrand) {
                    newStock = newStock === "" || isNaN(newStock) ? 0 : parseInt(newStock, 10);
                    try {
                        const response = await fetch("/edit", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                code,
                                location: newLocation,
                                product: newProduct,
                                brand: newBrand,
                                stock: newStock
                            })
                        });
                        if (response.ok) {
                            alert("Información actualizada");
                            loadTable();
                        } else {
                            alert("Error al actualizar la información");
                        }
                    } catch (error) {
                        console.error("Error al editar:", error);
                    }
                } else {
                    alert("Todos los campos son obligatorios.");
                }
            });
        });

        document.querySelectorAll(".btn-delete").forEach(button => {
            button.addEventListener("click", async () => {
                const code = button.getAttribute("data-code");
                if (confirm("¿Estás seguro de eliminar el código: " + code + "?")) {
                    try {
                        const response = await fetch("/delete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code })
                        });
                        if (response.ok) {
                            alert("Código eliminado");
                            loadTable();
                        } else {
                            alert("Error al eliminar el código");
                        }
                    } catch (error) {
                        console.error("Error al eliminar:", error);
                    }
                }
            });
        });
    };

    // Buscar un código específico
    searchBar.addEventListener("input", () => {
        const searchTerm = searchBar.value.trim(); // Quitar espacios en blanco
        if (searchTerm === "") {
            renderTable(allData); // Si no hay búsqueda, muestra todos los datos
        } else {
            // Convertir todo a cadenas para evitar errores en la comparación
            const filteredData = allData.filter(item =>
                String(item["Código de Barra"]).includes(searchTerm)
            );
            renderTable(filteredData);
        }
    });

    loadTable(); // Cargar la tabla al iniciar
});