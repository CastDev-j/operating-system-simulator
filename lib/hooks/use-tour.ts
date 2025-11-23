"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function useTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");

    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
        localStorage.setItem("hasSeenTour", "true");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    if (typeof window !== "undefined") {
      const driverObj = driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Siguiente",
        prevBtnText: "Anterior",
        doneBtnText: "Finalizar",
        progressText: "{{current}} de {{total}}",
        popoverClass: "driverjs-theme",
        steps: [
          {
            element: "#control-panel-section",
            popover: {
              title: "Panel de Control Principal",
              description:
                "Controla la ejecución del simulador: Iniciar/Detener la simulación automática, agregar procesos manualmente, descargar el estado completo del sistema, exportar la tabla FAT, o limpiar todo. El simulador genera procesos automáticamente con una probabilidad del 30% en cada ciclo (máximo 10 procesos).",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#speed-control-section",
            popover: {
              title: "Control de Velocidad de Ejecución",
              description:
                "Ajusta la velocidad de la simulación desde 0.5x (más lento, 2 segundos por ciclo) hasta 10x (muy rápido, 0.1 segundos por ciclo). Útil para observar el comportamiento en detalle o acelerar la demostración del sistema.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#processes-section",
            popover: {
              title: "Cola FIFO de Procesos",
              description:
                "Gestión de procesos mediante algoritmo FIFO (First-In-First-Out). Cada proceso tiene: ID único (P1, P2...), estado (nuevo/listo/ejecutando), tiempo de vida (5-15 segundos), y páginas de memoria (1-8). El primero en la cola se ejecuta hasta completar su tiempo. Los procesos sin memoria disponible esperan en la cola de espera.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#memory-section",
            popover: {
              title: "Memoria RAM con Paginación",
              description:
                "Sistema de memoria con 32 marcos de página de 4KB cada uno. Los marcos verdes están ocupados por procesos activos, mostrando el ID del proceso. Los marcos grises están libres. Cuando un proceso termina, libera automáticamente todos sus marcos para nuevos procesos en espera.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "#fat-section",
            popover: {
              title: "Sistema de Archivos FAT (File Allocation Table)",
              description:
                "Tabla de asignación de archivos con 128 clusters. El cluster 0 es el header del sistema (verde). Clusters grises están libres. Clusters verdes claros contienen datos y apuntan al siguiente cluster. Verde oscuro indica fin de archivo (EOF = -1). Cada archivo completado ocupa 1-5 clusters encadenados.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "#files-section",
            popover: {
              title: "Archivos del Sistema",
              description:
                "Archivos generados automáticamente cuando un proceso termina su ejecución. Cada archivo se nombra como 'archivo_X.txt' y contiene información del proceso. Puedes descargar archivos individuales (botón verde) o eliminarlos para liberar clusters en la FAT (botón rojo).",
              side: "top",
              align: "start",
            },
          },
        ],
      });

      driverObj.drive();
    }
  };

  return { startTour };
}
