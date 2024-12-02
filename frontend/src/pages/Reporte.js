import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export class Reporte {
  constructor() {
    this.doc = null;
    this.attendanceThreshold = 4;
  }

  async generateReport(attendances) {
    try {
      // Group attendances by student
      const studentAttendances = this.groupAttendancesByStudent(attendances);
      
      // Create PDF
      this.doc = new jsPDF();
      
      // Add header and date
      this.addHeader();
      
      // Generate attendance table
      this.generateAttendanceTable(studentAttendances);
      
      // Save PDF
      const month = format(new Date(), 'MMMM-yyyy', { locale: es });
      this.doc.save(`reporte-asistencias-${month}.pdf`);
      
      return true;
    } catch (error) {
      console.error('Error generating report:', error);
      return false;
    }
  }

  groupAttendancesByStudent(attendances) {
    const studentMap = new Map();

    attendances.forEach(attendance => {
      const studentKey = `${attendance.student.name} ${attendance.student.apellido}`;
      
      if (!studentMap.has(studentKey)) {
        studentMap.set(studentKey, {
          name: attendance.student.name,
          apellido: attendance.student.apellido,
          attendanceCount: 0,
          dates: new Set()
        });
      }

      const student = studentMap.get(studentKey);
      if (attendance.present) {
        student.attendanceCount++;
        student.dates.add(format(new Date(attendance.timestamp), 'dd/MM/yyyy', { locale: es }));
      }
    });

    return Array.from(studentMap.values()).map(student => ({
      ...student,
      dates: Array.from(student.dates).sort()
    }));
  }

  addHeader() {
    this.doc.setFontSize(20);
    this.doc.text('Reporte de Asistencias', 14, 20);
    
    this.doc.setFontSize(12);
    this.doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy', { locale: es })}`, 14, 30);
    this.doc.text(`Asistencias mínimas requeridas: ${this.attendanceThreshold}`, 14, 40);
  }

  generateAttendanceTable(studentAttendances) {
    const tableColumn = ['Nombre', 'Apellido', 'Total Asistencias', 'Estado', 'Fechas de Asistencia'];
    const tableRows = studentAttendances.map(student => [
      student.name,
      student.apellido,
      student.attendanceCount.toString(),
      student.attendanceCount >= this.attendanceThreshold ? 'Regular' : 'En Riesgo',
      student.dates.join(', ')
    ]);

    this.doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      },
      bodyStyles: {
        textColor: 0
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawCell: function(data) {
        // Only process body cells
        if (data.section === 'body') {
          // Get the attendance count from the third column (index 2)
          const row = data.row.raw;
          const attendanceCount = parseInt(row[2]);
          
          // If attendance is below threshold, color the entire row red
          if (attendanceCount < 4) {
            data.cell.styles.textColor = [255, 0, 0];
          }
        }
      },
      columnStyles: {
        0: { cellWidth: 40 },  // Nombre
        1: { cellWidth: 40 },  // Apellido
        2: { cellWidth: 30 },  // Total Asistencias
        3: { cellWidth: 30 },  // Estado
        4: { cellWidth: 'auto' }  // Fechas de Asistencia
      },
      margin: { top: 10 }
    });
  }
}