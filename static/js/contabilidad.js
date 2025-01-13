// Obtener datos y actualizar la interfaz
document.addEventListener("DOMContentLoaded", () => {
    // Obtener ingresos automáticos por tickets
    fetch("/contabilidad/ingresos_automaticos")
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#ingresos-automaticos tbody");
            data.forEach(([mes, ingresos]) => {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${mes}</td><td>$${ingresos.toFixed(2)}</td>`;
                tbody.appendChild(row);
            });
        });

    // Obtener datos para las gráficas
    fetch("/contabilidad/datos_graficas")
        .then(response => response.json())
        .then(data => {
            renderCharts(data.ingresos_automaticos, data.ingresos_gastos);
        });

    // Registrar ingresos y gastos manualmente
    document.getElementById("registro-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const fecha = document.getElementById("fecha").value;
        const ingresos = parseFloat(document.getElementById("ingresos").value) || 0;
        const gastos = parseFloat(document.getElementById("gastos").value) || 0;

        fetch("/contabilidad/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fecha, ingresos, gastos })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                location.reload(); // Recargar la página para actualizar datos
            });
    });
});

// Renderizar gráficas con Chart.js
function renderCharts(ingresosMensuales, ingresosGastos) {
    const ingresosLabels = ingresosMensuales.map(([mes]) => mes);
    const ingresosData = ingresosMensuales.map(([_, ingresos]) => ingresos);

    // Gráfica de ingresos mensuales
    new Chart(document.getElementById("ingresos-mensuales"), {
        type: "bar",
        data: {
            labels: ingresosLabels,
            datasets: [{
                label: "Ingresos por Tickets",
                data: ingresosData,
                backgroundColor: "#10b981",
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
            },
        }
    });

    const fechas = ingresosGastos.map(([fecha]) => fecha);
    const ingresosManual = ingresosGastos.map(([_, ingresos]) => ingresos);
    const gastosManual = ingresosGastos.map(([_, __, gastos]) => gastos);

    // Gráfica de ingresos vs gastos diarios
    new Chart(document.getElementById("ingresos-vs-gastos"), {
        type: "line",
        data: {
            labels: fechas,
            datasets: [
                {
                    label: "Ingresos",
                    data: ingresosManual,
                    borderColor: "#10b981",
                    fill: false,
                },
                {
                    label: "Gastos",
                    data: gastosManual,
                    borderColor: "#e11d48",
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
            },
        }
    });

    // Gráfica de balance mensual
    const balanceData = ingresosMensuales.map(([_, ingresos], index) => ingresos - gastosManual[index] || 0);

    new Chart(document.getElementById("balance-mensual"), {
        type: "pie",
        data: {
            labels: ingresosLabels,
            datasets: [{
                label: "Balance Mensual",
                data: balanceData,
                backgroundColor: ["#10b981", "#e11d48", "#3b82f6", "#f59e0b"],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" },
            },
        }
    });
}
