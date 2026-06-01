import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, MonthlyReport } from '../models/finance.models';

@Injectable({ providedIn: 'root' })
export class ReportPdfService {
  exportMonthlyReport(report: MonthlyReport): void {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const primary = [24, 143, 105] as const;
    const accent = [20, 33, 61] as const;

    pdf.setFillColor(primary[0], primary[1], primary[2]);
    pdf.roundedRect(32, 32, 531, 92, 18, 18, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text('SOB Controle', 56, 72);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Relatorio mensal ${report.reference}`, 56, 100);

    pdf.setTextColor(accent[0], accent[1], accent[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Resumo executivo', 32, 158);

    const stats = [
      [`Total gasto`, this.money(report.totalSpent)],
      [`Media diaria`, this.money(report.averageDaily)],
      [`Maior gasto`, this.money(report.highestExpense)],
      [`Transacoes`, String(report.totalTransactions)]
    ];

    let x = 32;
    stats.forEach(([label, value]) => {
      pdf.setFillColor(246, 248, 251);
      pdf.roundedRect(x, 176, 122, 72, 14, 14, 'F');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(104, 115, 141);
      pdf.text(label, x + 14, 200);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(accent[0], accent[1], accent[2]);
      pdf.text(value, x + 14, 226);
      x += 136;
    });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Insight do mes', 32, 288);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(80, 91, 114);
    const insightLines = pdf.splitTextToSize(report.insight, 500);
    pdf.text(insightLines, 32, 308);

    autoTable(pdf, {
      startY: 344,
      head: [['Categoria', 'Gasto', 'Limite', 'Percentual']],
      body: report.categories.map((category) => [
        category.category,
        this.money(category.spent),
        this.money(category.limit),
        `${category.percentage}%`
      ]),
      headStyles: {
        fillColor: [primary[0], primary[1], primary[2]],
        textColor: [255, 255, 255]
      },
      styles: {
        fontSize: 10,
        cellPadding: 10,
        textColor: [20, 33, 61]
      },
      alternateRowStyles: {
        fillColor: [246, 248, 251]
      }
    });

    const finalY = (pdf as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 344;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Sugestoes de economia', 32, finalY + 32);

    let suggestionY = finalY + 54;
    report.suggestions.forEach((suggestion) => {
      if (suggestionY > 730) {
        pdf.addPage();
        suggestionY = 64;
      }
      pdf.setFillColor(246, 248, 251);
      pdf.roundedRect(32, suggestionY - 16, 531, 52, 12, 12, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(suggestion.title, 44, suggestionY + 2);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(pdf.splitTextToSize(suggestion.description, 360), 44, suggestionY + 18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${this.money(suggestion.potentialMonthlySavings)}/mes`, 470, suggestionY + 2);
      suggestionY += 68;
    });

    if (suggestionY > 680) {
      pdf.addPage();
      suggestionY = 64;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(accent[0], accent[1], accent[2]);
    pdf.text('Lancamentos e comprovantes', 32, suggestionY + 8);

    autoTable(pdf, {
      startY: suggestionY + 24,
      head: [['Item', 'Categoria', 'Valor', 'Comprovante']],
      body: report.expenses.map((expense) => [
        expense.itemName,
        expense.category,
        this.money(expense.amount),
        expense.receiptName ?? 'Nao anexado'
      ]),
      headStyles: {
        fillColor: [accent[0], accent[1], accent[2]],
        textColor: [255, 255, 255]
      },
      styles: {
        fontSize: 9,
        cellPadding: 8,
        textColor: [20, 33, 61]
      },
      alternateRowStyles: {
        fillColor: [246, 248, 251]
      }
    });

    let receiptY = ((pdf as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? suggestionY + 24) + 24;
    report.expenses.filter((expense) => this.isImageReceipt(expense.receiptDataUrl)).forEach((expense) => {
      if (receiptY > 640) {
        pdf.addPage();
        receiptY = 48;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(accent[0], accent[1], accent[2]);
      pdf.text(expense.receiptName ?? expense.itemName, 32, receiptY);
      pdf.addImage(expense.receiptDataUrl as string, undefined, 32, receiptY + 12, 180, 120, undefined, 'FAST');
      receiptY += 152;
    });

    pdf.save(`sob-controle-relatorio-${report.reference}.pdf`);
  }

  private money(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private isImageReceipt(receiptDataUrl?: string | null): boolean {
    return !!receiptDataUrl && receiptDataUrl.startsWith('data:image/');
  }
}