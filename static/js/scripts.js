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

// Búsqueda en la tabla
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


function generateReport(data) {
    // Verifica si jsPDF está disponible
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("STD TICKETS DICE: jsPDF no está disponible. Verifica que la biblioteca esté correctamente cargada.");
        console.error("jsPDF no se encontró. Asegúrate de incluir la biblioteca.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Agregar logo
    const logoPath = '/static/images/logos.png';
    doc.addImage(logoPath, 'PNG', 10, 10, 30, 30); // Logo en la esquina superior izquierda

    // Configuración del encabezado del documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SERVICIO TÉCNICO STD", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("Reporte Técnico - Documento Informativo", 105, 27, { align: "center" });

    // Datos del negocio
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("STD - Soluciones Tecnológicas y Digitales", 105, 35, { align: "center" });
    doc.text("Teléfono: 427 371 9797", 105, 40, { align: "center" });

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Mensaje de agradecimiento
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Apreciamos su confianza al elegir nuestros servicios.", 20, 55);

    // Información del cliente
    doc.setFont("helvetica", "bold");
    doc.text("Información del Cliente:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`Folio: ${data.folio}`, 20, 75);
    doc.text(`Fecha de registro: ${data.timestamp}`, 20, 82);
    doc.text(`Nombre del cliente: ${data.nombre}`, 20, 89);
    doc.text(`Correo del cliente: ${data.correo}`, 20, 96);

    // Información del equipo y reparación
    doc.setFont("helvetica", "bold");
    doc.text("Detalles del Equipo y Reparación:", 20, 106);
    doc.setFont("helvetica", "normal");
    doc.text(`Tipo de reparación: ${data.tipoReparacion}`, 20, 115);
    doc.text(`Modelo del equipo: ${data.modelo}`, 20, 122);
    doc.text("Descripción del problema:", 20, 129);
    doc.text(data.descripcion, 25, 136, { maxWidth: 160 });

    // Garantía y términos
    doc.setFont("helvetica", "bold");
    doc.text("Garantía del Servicio:", 20, 155);
    doc.setFont("helvetica", "normal");
    doc.text(
        "Le informamos que esta reparación cuenta con una garantía de ___ días. Por favor conserve este documento como comprobante.",
        20,
        162,
        { maxWidth: 170 }
    );

    doc.setFont("helvetica", "bold");
    doc.text("Política de Retiro del Equipo:", 20, 175);
    doc.setFont("helvetica", "normal");
    doc.text(
        "Por favor tenga en cuenta que, si el equipo no es retirado dentro de las 3 semanas posteriores a la notificación de reparación completada, y sin aviso previo, el equipo será considerado abandonado y sujeto a desecho. Agradecemos su comprensión.",
        20,
        182,
        { maxWidth: 170 }
    );

    // Línea separadora final
    doc.setLineWidth(0.5);
    doc.line(20, 200, 190, 200);

    // Pie de página
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("Gracias por confiar en nosotros. Si tiene alguna consulta, no dude en contactarnos.", 20, 210);
    doc.text("Atentamente, Equipo de Servicio Técnico STD", 20, 217);

    // Guardar el archivo PDF
    doc.save(`reporte_${data.folio}.pdf`);
}


// Asignar atributos `data-folio` a las filas
document.addEventListener('DOMContentLoaded', function () {
    try {
        const rows = document.querySelectorAll("table tbody tr");
        rows.forEach(row => {
            const folioCell = row.querySelector("td:first-child");
            if (folioCell) {
                row.setAttribute("data-folio", folioCell.textContent.trim());
            }
        });
        console.log("Atributos data-folio asignados correctamente.");
    } catch (error) {
        console.error("Error al asignar atributos data-folio:", error);
        alert("STD TICKETS DICE: No se pudieron asignar los atributos data-folio.");
    }
});
function logout() {
    // Redirige al usuario al login
    window.location.href = "/";
}
