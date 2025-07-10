/**
 * UTILS
 * Helper functions
 */

/**
 * Returns the dimensions of a given table with a specific offset
 * @param {array} table The table to calculate 
 * @param {number} rowOffset Offset number of rows  
 * @param {number} columnOffset offset number of columns  
 * @return {array} A table with the coordinates
*/
function getTableDim(table, rowOffset, columnOffset) {
  const startRow = rowOffset ? rowOffset : 1;
  const startColumn = columnOffset ? columnOffset : 1;

  const numRows = table.length;
  const numCols = Math.max(...table.map(a => a.length));

  return [startRow, startColumn, numRows, numCols]
}
