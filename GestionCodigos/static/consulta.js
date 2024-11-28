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
                <td colspan="5" class="text-center">No se encontraron registros</td>
            `;
            table.appendChild(row);
        } else {
            data.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item["Código de Barra"]}</td>
                    <td>${item["Producto"]}</td>
                    <td>${item["Marca"]}</td>
                    <td>${item["Ubicación"]}</td>
                    <td>
                        <button class="btn btn-warning btn-edit" data-code="${item["Código de Barra"]}">Editar</button>
                        <button class="btn btn-danger btn-delete" data-code="${item["Código de Barra"]}">Eliminar</button>
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
                const newProduct = prompt("Ingresa el nuevo nombre del producto para el código: " + code);
                const newBrand = prompt("Ingresa la nueva marca para el código: " + code);
                const newLocation = prompt("Ingresa la nueva ubicación para el código: " + code);
                if (newProduct && newBrand && newLocation) {
                    try {
                        const response = await fetch("/edit", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code, product: newProduct, brand: newBrand, location: newLocation })
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
            if (filteredData.length === 0) {
                renderTable([]); // Si no hay resultados, muestra mensaje de "No se encontraron registros"
            } else {
                renderTable(filteredData); // Muestra solo el registro encontrado
            }
        }
    });

    loadTable(); // Cargar la tabla al iniciar
});