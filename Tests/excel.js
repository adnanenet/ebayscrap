const fs = require('fs');
const XLSX = require('xlsx');

// Define the full path to the JSON file and the output Excel file
const jsonFilePath = 'C:\\Users\\robot\\Downloads\\Programs\\ebay\\items_data.json';
const excelFilePath = 'C:\\Users\\robot\\Downloads\\Programs\\ebay\\items_data.xlsx';

// Read and parse the JSON file
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// Convert JSON object to an array of objects
const dataArray = Object.keys(jsonData).map(key => jsonData[key]);

// Convert JSON array to a worksheet
const worksheet = XLSX.utils.json_to_sheet(dataArray);

// Create a new workbook and append the worksheet
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');

// Write the workbook to an Excel file
XLSX.writeFile(workbook, excelFilePath);

console.log('Excel file created:', excelFilePath);
