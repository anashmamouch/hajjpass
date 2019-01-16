userpaApp.factory('hceFactory', ['localStorage', 'imagesFactory','snackbar', '$ionicLoading', '$ionicPopup',  function (localStorage, imagesFactory, snackbar, $ionicLoading, $ionicPopup) {
    var SELECT_APDU = buildSelectApdu(SAMPLE_LOYALTY_CARD_AID);
    var currentPos = 0;
    var isAppSelected = false;
    var imgBase64;
    var nbTrames = 0;
    var imgFramesArray = [];
    function toPaddedHexString(i) {
        return ("00" + i.toString(16)).substr(-2);
    }
    var accountNumberAsBytes;
    imagesFactory.resizeImage(localStorage.get('userImg'), function (imgRes) {
        imgBase64 = imgRes;
        imgFramesTemp = imgBase64.match(/.{1,255}/g);
        
        nbTrames = imgFramesTemp.length;
        for (var i = 0; i < nbTrames; i++) {
            imgFramesArray.push(hce.util.stringToBytes(imgFramesTemp[i]));
        }
        console.log(nbTrames);
        
    });
    function buildSelectApdu(aid) {
        // Format: [CLASS | INSTRUCTION | PARAMETER 1 | PARAMETER 2 | LENGTH | DATA]
        var aidByteLength = toPaddedHexString(aid.length / 2);
        var data = SELECT_APDU_HEADER + aidByteLength + aid;
        return data.toLowerCase();
    }
    var factory = {
       

        initialize: function () {
            hce.registerCommandCallback(factory.onCommand);

            // register to for deactivated callback
            hce.registerDeactivatedCallback(factory.onDeactivated);

            factory.okCommand = hce.util.hexStringToByteArray(SELECT_OK_SW);
            factory.unknownCommand = hce.util.hexStringToByteArray(UNKNOWN_CMD_SW);
            console.log("hce_init");
        },
        // onCommand is called when an APDU command is received from the HCE reader
        // if the select apdu command is received, the loyalty card data is returned to the reader
        // otherwise unknown command is returned
        onCommand: function (command) {
            console.log(command);
            var commandAsBytes = new Uint8Array(command);
            var commandAsString = hce.util.byteArrayToHexString(commandAsBytes);
           
            if (commandAsString !== "00b0000001") {

                //alert(commandAsString);
                console.log('received command ' + commandAsString);
                console.log('expecting        ' + SELECT_APDU);



                if (SELECT_APDU === commandAsString) {
                    $ionicLoading.show({
                        //templateUrl: 'templates/loadingTemplate.html'
                    });
                    if (localStorage.get("isRegister") === "true") {
                        accountNumberAsBytes = hce.util.stringToBytes(localStorage.get("numotipassNb") + ";" + localStorage.get("name") + ";" + localStorage.get("lastName") + ";" + nbTrames.toString());
                    }
                    else {
                        accountNumberAsBytes = hce.util.stringToBytes(localStorage.get("numotipassNb"));
                    }
                    var data = hce.util.concatenateBuffers(accountNumberAsBytes, factory.okCommand);

                    console.log('Sending ' + hce.util.byteArrayToHexString(data));
                    hce.sendResponse(data);

                    /*for (var i = 0; i < nbTrames; i++) {
                        if (commandAsBytes[0] === 0 && commandAsBytes[1] === 176) {
    
                            console.log("commande " + i);
                            var data2 = hce.util.concatenateBuffers(hce.util.stringToBytes("ok"), factory.okCommand);
    
                            hce.sendResponse(data2);
                        }
                    }*/
                } else if (commandAsBytes[0] === 0 && commandAsBytes[1] === 176 && commandAsBytes[4] === 255) {
                    var data2 = hce.util.concatenateBuffers(imgFramesArray[currentPos], factory.okCommand);
                    currentPos++;
                    hce.sendResponse(data2);
                    if (currentPos >= nbTrames) {
                        currentPos = 0;
                        $ionicLoading.hide();
                    }
                }



                else {
                    console.log('UNKNOWN CMD SW');
                    hce.sendResponse(factory.unknownCommand);
                }
            }

        },
        onDeactivated: function (reason) {
            console.log('Deactivated ' + reason);
            if (currentPos != 0) {
                snackbar.createSnackbar("Commande interrompue, veuillez réessayer");
            }
            
            
            currentPos = 0;
            $ionicLoading.hide();
            
        }
    }
    return factory;
}]);