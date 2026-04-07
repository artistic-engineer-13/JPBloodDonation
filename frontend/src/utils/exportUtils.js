const sanitizeCsv = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
};

export const exportRowsToCsv = ({ filename, columns, rows }) => {
  const header = columns.map((column) => sanitizeCsv(column.label)).join(',');

  const dataRows = rows.map((row) => {
    return columns
      .map((column) => {
        const value = typeof column.value === 'function' ? column.value(row) : row[column.value];
        return sanitizeCsv(value);
      })
      .join(',');
  });

  const csvContent = [header, ...dataRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
