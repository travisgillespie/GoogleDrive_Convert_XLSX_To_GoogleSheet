//TODO: locate convert_XLSX_to_gSheet() in Utils.gs script... try to replace folderID with your SalesTeamDrive folder, rather than gDrive Historical folderID
function main() {
  const constant_FolderName_SalesOperations = "FOLDER NAME"; //root folder name in Shared Team Drive1... xlsx file I'm copying is stored here
  const constant_FolderName_SalesEnablement = "FOLDER NAME"; //root folder name in Shared Team Drive2
  const constant_FolderName_Historic = "FOLDER NAME"; //folder name in Shared Team Drive2... non-essential used for dummy data / testing
  const constant_FolderName_MetricsReporting = "FOLDER NAME"; //folder name in Shared Team Drive2... subfolder of root
  const constant_FolderName_SalesOps = "FOLDER NAME"; //folder name in Shared Team Drive2... subfolder of constant_FolderName_MetricsReporting
  const constant_FolderName_ArchivedData = "FOLDER NAME"; //subfolder name in My Personal GDrive... intermediate folder used to create copy gSheet since google API doeasn't allow you to transfer/convert files b/w Team Drives
  const constant_FileName_SalesOrgTracker_XLSX = = "FILE NAME.xlsx"; //place file extension inside string... name of file you are going to copy
  const constant_FileName_SalesOrgTracker_gSheet = "GOOGLE SHEET FILE NAME"; //no file extension needed inside string... name of file you are going to copy data to
  const constant_tabName_XLSX = "TAB NAME INSIDE XLSX FILE"; //data you are copying is stored in this tab
  const constant_tabName_gSheet = "TAB NAME INSIDE GOOGLE SHEET"; //data you are setting will be stored in this tab

  //my gDrive folders
  var root_mainFolder_historicData = getFolder(null, constant_FolderName_Historic)
  var root_mainFolder_archivedData = getFolder(null, constant_FolderName_ArchivedData, root_mainFolder_historicData)
  //var folderID_historicData = root_mainFolder_historicData.getId()
  //Logger.log("ID: " + folderID_historicData)

  //sales enablement team drive
  var teamFolder_salesEnablement = getTeamFolder(Drive.Teamdrives,constant_FolderName_SalesEnablement)
  var folderID_salesEnablement = teamFolder_salesEnablement.id
  var root_salesEnablement_Metrics = getFolder(folderID_salesEnablement, constant_FolderName_MetricsReporting) // teamDrive SalesEnablement > SalesOps_sub_folder
  var root_salesEnablement_Ops = getFolder(null, constant_FolderName_SalesOps, root_salesEnablement_Metrics)
  //  var root_historicData = getFolder(null, "_historicData", root_salesEnablement_Ops)

  //sales ops team drive
  var teamFolder_salesOperations = getTeamFolder(Drive.Teamdrives, constant_FolderName_SalesOperations)
  var folderID_salesOperations = teamFolder_salesOperations.id
  var root_salesOperations = getFolder(folderID_salesOperations,null)

  //clean up historic data folder
  cleanUpHistoricFolder(root_mainFolder_historicData, root_mainFolder_archivedData)

  //locate xlsx file and gSheet
  var xlsxFile = findFile(root_salesOperations, constant_FileName_SalesOrgTracker_XLSX)
  var gSheet_NewHireTracker = findFile(root_salesEnablement_Ops, constant_FileName_SalesOrgTracker_gSheet)

  //convert xlsx file to gsheet
  //var newFile = convert_XLSX_to_gSheet(xlsxFile, root_historicData)
  var newFile = convert_XLSX_to_gSheet(xlsxFile, root_mainFolder_historicData)

  //open new file
  var ss = SpreadsheetApp
  var open_NewFile = ss.openById(newFile.id)
  var sheet_NewFile = open_NewFile.getSheetByName(constant_tabName_XLSX)

  //copy data from specific range
  var range_NewFile = sheet_NewFile.getRange("A1 NOTATION e.g B6:HA")
  var values_NewFile = range_NewFile.getValues()

  //open gSheet Sales Org Tracker
  var open_UpdateFile = ss.openById(gSheet_NewHireTracker.getId())
  var sheet_UpdateFile = open_UpdateFile.getSheetByName(constant_tabName_gSheet)

  //clear gSheet Sales Org Tracker
  sheet_UpdateFile.clear()

  //update gSheet Sales Org Tracker with new copied data & format cells
  var arrayCounter = counterArrayItems(values_NewFile);

  //update&format1: format headers
  sheet_UpdateFile.getRange(1, 1, 1, arrayCounter).setBackground("COLOR e.g. #3c78d8").setFontColor("COLOR e.g. White")
  var range_UpdateFile1 = sheet_UpdateFile.getRange(1, 1,values_NewFile.length,values_NewFile[0].length)
  range_UpdateFile1.setValues(values_NewFile)

  //update&format2: add link to folder where source file is located
  var sourceDataColumn = arrayCounter+2
  var range_UpdateFile2 = sheet_UpdateFile.getRange(1,sourceDataColumn) //getRange(row1, two columns to right of last copied data)
  range_UpdateFile2.setFormula('=HYPERLINK("'+root_salesOperations.getUrl()+'","Source Folder To: ./'+constant_FileName_SalesOrgTracker_XLSX+'")')

  //update&format3: add timestamp
  var range_UpdateFile3 = sheet_UpdateFile.getRange(2,sourceDataColumn)
  range_UpdateFile3.setValue("Source File Last Updated: " + xlsxFile.getLastUpdated())
  sheet_UpdateFile.getRange(1,sourceDataColumn,2).setBackground("#999999") //getRange(row1, two columns to right of last copied data, total of two rows)
}
