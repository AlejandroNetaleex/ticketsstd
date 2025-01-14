let currentFolio = null; // Variable global para manejar el folio actual en operaciones

// Mostrar formulario emergente
function showForm(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`El formulario con ID "${formId}" no existe.`);
        alert(`STD TICKETS DICE: No se pudo mostrar el formulario. Verifica la consola.`);
        return;
    }
    form.style.display = 'flex';
    console.log(`Formulario "${formId}" mostrado correctamente.`);
}

// Ocultar formulario emergente
function hideForm(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`El formulario con ID "${formId}" no existe.`);
        alert(`STD TICKETS DICE: No se pudo ocultar el formulario. Verifica la consola.`);
        return;
    }
    form.style.display = 'none';
    console.log(`Formulario "${formId}" ocultado correctamente.`);
}

// Confirmar eliminación con contraseña
function confirmDelete(folio) {
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
}

// Abrir modal de Actualizar Estatus
function openStatusModal(folio) {
    currentFolio = folio;
    showForm('updateStatusForm');
    console.log(`Modal de actualizar estatus abierto para el folio: ${folio}`);
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
    const cost = prompt("STD TICKETS DICE: Introduce el costo (en números):");
    if (!cost || isNaN(cost)) {
        alert("STD TICKETS DICE: Costo inválido. Por favor introduce un número válido.");
        return;
    }
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
}

// Búsqueda dinámica en la tabla
function searchTable() {
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
}

// Generar reporte técnico en PDF
function generateReport(data) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("STD TICKETS DICE: jsPDF no está disponible. Verifica que la biblioteca esté correctamente cargada.");
        console.error("jsPDF no se encontró. Asegúrate de incluir la biblioteca.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración del encabezado
    doc.setFont("helvetica", "bold");
    doc.text(`Reporte Técnico: ${data.folio}`, 10, 10);
    doc.text(`Nombre del cliente: ${data.nombre}`, 10, 20);
    doc.text(`Modelo del equipo: ${data.modelo}`, 10, 30);
    doc.text(`Descripción:`, 10, 40);
    doc.text(data.descripcion, 10, 50, { maxWidth: 180 });

    doc.save(`reporte_${data.folio}.pdf`);
}

// Asignar evento de búsqueda al campo de entrada
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", searchTable);
        console.log("Búsqueda dinámica habilitada.");
    }

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
