let currentFolio = null; // Variable global para manejar el folio actual en operaciones

// Mostrar formulario emergente
function showForm(formId) {
    try {
        const form = document.getElementById(formId);
        if (!form) throw new Error(`El formulario con ID "${formId}" no existe.`);
        form.style.display = 'flex';
        console.log(`Formulario "${formId}" mostrado correctamente.`);
    } catch (error) {
        console.error(`Error al mostrar el formulario "${formId}":`, error);
        alert(`STD TICKETS DICE: No se pudo mostrar el formulario. Verifica la consola para más detalles.`);
    }
}

// Ocultar formulario emergente
function hideForm(formId) {
    try {
        const form = document.getElementById(formId);
        if (!form) throw new Error(`El formulario con ID "${formId}" no existe.`);
        form.style.display = 'none';
        console.log(`Formulario "${formId}" ocultado correctamente.`);
    } catch (error) {
        console.error(`Error al ocultar el formulario "${formId}":`, error);
        alert(`STD TICKETS DICE: No se pudo ocultar el formulario. Verifica la consola para más detalles.`);
    }
}

// Confirmar eliminación con contraseña
function confirmDelete(folio) {
    try {
        const password = prompt("STD TICKETS DICE: Introduce la contraseña para eliminar este registro:");
        if (password !== "2025") {
            alert("STD TICKETS DICE: Contraseña incorrecta. No se puede eliminar el registro.");
            return;
        }
        if (confirm("STD TICKETS DICE: ¿Estás seguro de que deseas eliminar este ticket?")) {
            fetch(`/delete/${folio}`, { method: "DELETE" })
                .then(response => response.json())
                .then(data => {
                    alert("STD TICKETS DICE: " + data.message);
                    window.location.reload();
                })
                .catch(err => {
                    console.error("Error al eliminar el ticket:", err);
                    alert("STD TICKETS DICE: Ocurrió un error al intentar eliminar el ticket.");
                });
        }
    } catch (error) {
        console.error("Error en la función confirmDelete:", error);
        alert("STD TICKETS DICE: Ocurrió un error al intentar eliminar el ticket.");
    }
}

// Abrir modal de Actualizar Estatus
function openStatusModal(folio) {
    try {
        const statusCell = document.querySelector(`tr[data-folio="${folio}"] td:nth-child(11)`);
        const currentStatus = statusCell.textContent.trim();
        if (currentStatus === "ENTREGADO") {
            const password = prompt("STD TICKETS DICE: Introduce la contraseña para desbloquear:");
            if (password !== "2025") {
                alert("STD TICKETS DICE: Contraseña incorrecta.");
                return;
            }
        }
        currentFolio = folio;
        showForm('updateStatusForm');
        console.log(`Modal de actualizar estatus abierto para el folio: ${folio}`);
    } catch (error) {
        console.error("Error al abrir el modal de actualizar estatus:", error);
        alert("STD TICKETS DICE: No se pudo abrir el modal de actualizar estatus.");
    }
}

// Manejo del formulario de Actualizar Estatus
document.getElementById('statusForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const newStatus = document.getElementById('newStatus').value;
    fetch(`/update_status/${currentFolio}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_status: newStatus })
    })
        .then(response => response.json())
        .then(data => {
            alert("STD TICKETS DICE: " + data.message);
            window.location.reload();
        })
        .catch(err => {
            console.error("Error al actualizar el estatus:", err);
            alert("STD TICKETS DICE: Ocurrió un error al actualizar el estatus.");
        });
});

// Agregar costo
function addCost(folio) {
    try {
        const costCell = document.querySelector(`tr[data-folio="${folio}"] td:nth-child(10)`);
        if (costCell.textContent.trim() !== "None") {
            const password = prompt("STD TICKETS DICE: Introduce la contraseña para actualizar el costo:");
            if (password !== "2025") {
                alert("STD TICKETS DICE: Contraseña incorrecta.");
                return;
            }
        }
        const cost = prompt("STD TICKETS DICE: Introduce el costo (en números):");
        if (cost && !isNaN(cost)) {
            fetch(`/add_cost/${folio}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cost })
            })
                .then(response => response.json())
                .then(data => {
                    alert("STD TICKETS DICE: " + data.message);
                    window.location.reload();
                })
                .catch(err => {
                    console.error("Error al agregar el costo:", err);
                    alert("STD TICKETS DICE: Ocurrió un error al intentar agregar el costo.");
                });
        } else {
            alert("STD TICKETS DICE: Costo inválido. Por favor introduce un número válido.");
        }
    } catch (error) {
        console.error("Error en la función addCost:", error);
        alert("STD TICKETS DICE: Ocurrió un error al intentar agregar el costo.");
    }
}

// Búsqueda en la tabla por Folio, Nombre o Modelo del Equipo
function searchTable() {
    try {
        const searchValue = document.getElementById("searchInput").value.toLowerCase();
        const rows = document.querySelectorAll("table tbody tr");

        rows.forEach(row => {
            const folio = row.querySelector("td:nth-child(1)").textContent.toLowerCase();
            const nombre = row.querySelector("td:nth-child(3)").textContent.toLowerCase();
            const modelo = row.querySelector("td:nth-child(7)").textContent.toLowerCase();

            const match =
                folio.includes(searchValue) ||
                nombre.includes(searchValue) ||
                modelo.includes(searchValue);

            row.style.display = match ? "" : "none";
        });

        console.log(`Búsqueda dinámica: "${searchValue}"`);
    } catch (error) {
        console.error("Error en la búsqueda de la tabla:", error);
        alert("STD TICKETS DICE: Ocurrió un error durante la búsqueda.");
    }
}

// Asignar evento de búsqueda al campo de entrada
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", searchTable);
        console.log("Búsqueda dinámica habilitada.");
    } else {
        console.error("No se encontró el campo de entrada de búsqueda.");
    }
});

// Generar reporte técnico en PDF
function generateReport(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`Reporte Técnico: ${data.folio}`, 10, 10);
    doc.save(`reporte_${data.folio}.pdf`);
}

// Asignar atributos `data-folio` a las filas
document.addEventListener('DOMContentLoaded', function () {
    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach(row => {
        const folioCell = row.querySelector("td:first-child");
        if (folioCell) row.setAttribute("data-folio", folioCell.textContent.trim());
    });
});

// Botón de logout
function logout() {
    window.location.href = "/";
}
