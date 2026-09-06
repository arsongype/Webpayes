import jsPDF from 'jspdf';
import type { AnalyticsResponse } from '../pages/Merchant/MerchantDashboard';

export const exportDashboardToPdf = (data: AnalyticsResponse, days: number) => {
  const doc = new jsPDF();
  const title = 'WebPaysh - Export Analyses';
  const date = new Date().toLocaleString('fr-FR');

  doc.setFontSize(18);
  doc.text(title, 14, 16);
  doc.setFontSize(11);
  doc.text(`Période : ${days} jours`, 14, 24);
  doc.text(`Exporté le : ${date}`, 14, 30);

  doc.setFontSize(13);
  doc.text('Résumé', 14, 40);
  doc.setFontSize(11);
  doc.text(`Volume total : ${data.totalVolume.toFixed(2)} €`, 14, 48);
  doc.text(`Transactions : ${data.totalTransactions}`, 14, 54);
  doc.text(`Taux de réussite : ${data.successRate.toFixed(1)}%`, 14, 60);
  doc.text(`Réussies : ${data.completedTransactions}`, 14, 66);
  doc.text(`En attente : ${data.pendingTransactions}`, 14, 72);
  doc.text(`Échouées : ${data.failedTransactions}`, 14, 78);

  let y = 90;
  doc.setFontSize(13);
  doc.text('Volume par jour', 14, y);
  y += 6;
  doc.setFontSize(11);
  data.dailyVolumes.forEach((d) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${new Date(d.date).toLocaleDateString('fr-FR')} : ${d.volume.toFixed(2)} €`, 14, y);
    y += 6;
  });

  y += 6;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(13);
  doc.text('Répartition par méthode', 14, y);
  y += 6;
  doc.setFontSize(11);
  data.methodBreakdown.forEach((m) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${m.method} : ${m.count}`, 14, y);
    y += 6;
  });

  doc.save(`webpaysh-analytics-${Date.now()}.pdf`);
};

export const exportTableToPdf = <T extends Record<string, unknown>>({
  title,
  subtitle,
  columns,
  rows,
}: {
  title: string;
  subtitle?: string;
  columns: Array<{ key: keyof T; label: string }>;
  rows: T[];
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 16;

  doc.setFontSize(16);
  doc.text(title, margin, y);
  y += 6;

  if (subtitle) {
    doc.setFontSize(11);
    doc.text(subtitle, margin, y);
    y += 6;
  }

  doc.setFontSize(10);
  const colWidth = pageWidth / columns.length;
  columns.forEach((col) => {
    doc.text(String(col.label), margin + columns.indexOf(col) * colWidth, y);
  });
  y += 4;

  doc.setLineWidth(0.1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  rows.forEach((row) => {
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
    columns.forEach((col) => {
      const value = row[col.key];
      doc.text(value == null ? '' : String(value), margin + columns.indexOf(col) * colWidth, y);
    });
    y += 6;
  });

  doc.save(`${title.replace(/[^a-zA-Z0-9-_]+/g, '-').toLowerCase()}-${Date.now()}.pdf`);
};
