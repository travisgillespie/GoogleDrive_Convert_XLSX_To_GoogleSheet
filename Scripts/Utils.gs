function getFolder(id,name,root){
  //id_NO,name_NO... should return root_main_drive
  //id_NO,name_YES... should return to main_drive_subFolder
  //id_YES,name_NO... should return team_drive_root OR main_drive_subFolder
  //id_YES,name_YES... should return to team_drive_root OR main_drive_subFolder_subfolder

  if(root == null){
    //you are in your mainDrive
    root = DriveApp;
  }

  if(id != null){
    //you are in teamDrive
    root = DriveApp.getFolderById(id);
  }

  if(name == null){
    //if subFolder name not provided return the root folder you are in
    Logger.log("Name is NULL")
    return root;
  }

  //create a folder iterator
  var folderIter = root.getFoldersByName(name);
  var folder = null;

  //check if folder iterator has next object
  if(folderIter.hasNext()){
    //if a next item exists, set folder fvariable equal to next item
    folder = folderIter.next()
  }

  //if folder still equals null, catch it here
  if(folder == null){
    Logger.log("Could not find/set subFolder")
  }
  return folder
}

function getTeamFolder(root,teamDriveName){
  var fileIter = root.list().items
  for(var i = 0; i < fileIter.length; i++){
    var currentDrive = fileIter[i]
    var driveName = currentDrive.name
    if(driveName == teamDriveName){
      return currentDrive
    }
  }
  return null
}

function findFile(root, fileName){
  var files = root.getFiles()
  while(files.hasNext()){
    var file = files.next();
    if(file.getName() == fileName){
      return file
    }
  }
  Logger.log("Could Not Find File")
  return null
}

function convert_XLSX_to_gSheet(xlsxFILE, root){
  var xlsxBlob = xlsxFILE.getBlob();

  //create object parameters
  var fileObjParms = {title: "copy_"+xlsxFILE.getName()+"_"+getTimeStamp(),
                      mimeType: MimeType.GOOGLE_SHEETS,
  //TODO: TRY TO FIND WAY TO USE TEAM FOLDER ID
                      //parents: [{id:"<TEAM FOLDER ID>"}]
                      parents: [{id: root.getId()}]
                      };

  var newFile = Drive.Files.insert(fileObjParms,xlsxBlob);
  return newFile
}

function getDate(){
  return new Date()
}

function getTimeStamp(){
  //return ms timestamp
  return Math.round(new Date().getTime()/1000);
}

function counterArrayItems(array){
  var counter = 0;

  for(var i = 0; i < array[0].length; i++ ){
    if(array[0][i].toString().length > 0){
      counter += 1;
    }
  }

  return counter;
}

function getFileNames(root){
  //get reference to file iterator
  var fileIter = root.getFiles();

  //create an array of file names
  var fileNames = [];

  //use while loop to iterate through folder iterator
  while(fileIter.hasNext()){
    //returns reference to the next file
    var file = fileIter.next();
    var name = file.getName();
    fileNames.push(name);
  }

  //now that you have list of file names, return the array
  return fileNames;
}

function cleanUpHistoricFolder(root, archive, total){
  //first check to see that total equals a value that can be used to count the number of folders
  if(total == null || total == NaN){
    //if total is not set, then set the value to 5
    total = 5;
  }

  //get all folder names inside the root folder
  var names = getFileNames(root)

  //reorder the returned array in descinding order via timestamp
  names.sort(function(a, b) {return b-a});

  //get total number of files
  var fileTotal = names.length;

  //test if total number of files is greater than total number you want displayed
  if(fileTotal >= total){

    //if true, use for loop to archive files
    //setting index to total-1 to skip over the first n items of the array... in other words start removing files at the nth element
    for(var i = total - 1; i < fileTotal; i++){
        //get reference to file
        var file = findFile(root, names[i])

      if(file != null){
          archive.addFile(file);
          root.removeFile(file);
      }
    }
  }
}
