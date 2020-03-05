
const newReimbursement = 300;
const errorOccurredScreen = 1;
const submitConfirmScreen = 400;
const mainMenu = 100;
const pendingRequestsScreen = 800;
const viewRequestScreen = 1200;
const pendingApprovalsScreen = 1400;
const allRequestsScreen = 1800;
menuScreen = 0;
reimbursementRequestInfo = null;
currentRequestList = null;
currentRequest = null;
gradingFormats = null;
statusNames = null;
reimbursementTypes = null;
reimbursementRates = null;
maxAmount = null;
projectedAmount = null;
appMain = document.getElementById("appmain");
errorOccurred = `
<h1>Sorry, an error occurred</h1>
`;

function modifyReimbursement(){
    let buttons = document.getElementById("buttons");
    buttons.style.display = "none";
    let confirmContainer = document.getElementById("confirm-warning");
    let announceText = document.createElement("p");
    announceText.innerText = "Modify reimbursement amount";
    confirmContainer.appendChild(announceText);
    let labelElement = document.createElement("label");
    labelElement.htmlFor = "new-amount";
    labelElement.innerText = "Enter new amount: ";
    let newAmount = document.createElement("input");
    newAmount.name = "new-amount";
    newAmount.type = "text";
    newAmount.onchange = checkValidAmount;
    confirmContainer.appendChild(labelElement);
    confirmContainer.appendChild(newAmount);
    confirmContainer.appendChild(document.createElement("br"));
    labelElement = document.createElement("label");
    labelElement.htmlFor = "alt-reason";
    labelElement.innerText = "Alteration reason (required): ";
    let altReason = document.createElement("textarea");
    altReason.style.width = "90%";
    altReason.rows = "4";
    confirmContainer.appendChild(labelElement);
    confirmContainer.appendChild(document.createElement("br"));
    confirmContainer.appendChild(altReason);
    confirmContainer.appendChild(document.createElement("br"));
    let buttonsContainer = document.createElement("div");
    confirmContainer.appendChild(buttonsContainer);
    let backButton
    let submitButton
    initialButtons();
    confirmContainer.appendChild(document.createElement("br"));
    let statusField = document.createElement("p");
    statusField.innerHTML = "<br>";
    confirmContainer.appendChild(statusField);

    function initialButtons(){
        buttonsContainer.innerHTML="";
        backButton = document.createElement("button");
        backButton.type = "button";
        backButton.innerText = "Cancel";
        buttonsContainer.appendChild(backButton);
        backButton.onclick = restorePreviousOptions;
        submitButton = document.createElement("button");
        submitButton.type = "button";
        submitButton.innerText = "Submit Change";
        buttonsContainer.appendChild(submitButton);
        submitButton.onclick = confirmValidEntries;
    }

    function checkValidAmount(){
        let results = (newAmount.value.search("^[0-9]+(\\.[0-9]{1,2})?$") != -1);
        if (!results) statusField.innerHTML = "You must enter a number";
        return results;
    }

    function restorePreviousOptions(){
        buttons.style.display = "initial";
        confirmContainer.innerHTML = "";
    }

    function confirmValidEntries(){
        if (altReason.value.length == 0) {
            statusField.innerHTML = "Alteration reason cannot be left blank";
            return;
        }
        if (!checkValidAmount) return;
        statusField.innerHTML = "<br>";
        buttonsContainer.innerHTML = "";
        let cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.innerText = "Cancel";
        buttonsContainer.appendChild(cancelButton);
        cancelButton.onclick = cancelHandler;
        let confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.innerText = "Confirm";
        buttonsContainer.appendChild(confirmButton);
        confirmButton.onclick = sendRequestChange;
        statusField.innerHTML = "Do you really want to approve this request with the above alterations?";
        newAmount.disabled = true;
        altReason.disabled = true;
    }

    function cancelHandler(){
        newAmount.disabled = false;
        altReason.disabled = false;
        initialButtons();
    }

    function sendRequestChange(){
        currentRequest.approvedAmount = newAmount.value;
        currentRequest.amountAltered = true;
        currentRequest.alterationReason = altReason.value;
        currentRequest.benCoStatus = 'APPROVED';
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = resolve;
        xhr.open("PUT","r");
        xhr.setRequestHeader("Content-Type","application/json;charset=utf-8");
        xhr.send(JSON.stringify(currentRequest));

        function resolve(){
            if (xhr.readyState === 1){
                statusField.innerHTML="Sending approval...";
            }
            if (xhr.readyState === 4){
                if (xhr.status === 204){
                    statusField.innerHTML="Successfully approved request with changes";
                    let returnToMainMenu = document.createElement("button");
                    returnToMainMenu.type = "button";
                    returnToMainMenu.innerText = "Return to Main Menu";
                    buttonsContainer.innerHTML = "";
                    buttonsContainer.appendChild(returnToMainMenu);
                    returnToMainMenu.onclick = setupMainMenu;
                } else {
                    statusField.innerHTML = "Error: server returned status "+status;
                    cancelHandler;
                }
            }
        }
    }
}

function confirmPass(){
    let buttons = document.getElementById("buttons");
    buttons.style.display = "none";
    let confirmContainer = document.getElementById("confirm-warning");
    let textContainer = document.createElement("p");
    textContainer.innerText = "Confirm successful completion of event:";
    confirmContainer.appendChild(textContainer);
    let actionsContainer = document.createElement("div");
    confirmContainer.appendChild(actionsContainer);
    newElement = document.createElement("br");
    actionsContainer.appendChild(newElement);
    newElement = document.createElement("button");
    newElement.type = "button";
    newElement.innerText = "Cancel";
    actionsContainer.appendChild(newElement);
    newElement.onclick = restorePreviousOptions;
    newElement = document.createElement("button");
    newElement.type = "button";
    newElement.innerText = "Yes";
    actionsContainer.appendChild(newElement);
    newElement.onclick = sendApprove;
    newElement = document.createElement("button");
    newElement.type = "button";
    newElement.innerText = "No";
    actionsContainer.appendChild(newElement);
    newElement.onclick = sendReject;

    function restorePreviousOptions(){
        confirmContainer.innerHTML = "";
        buttons.style.display = "initial";
    }

    function sendApprove(){
        currentRequest.benCoStatus = "APPROVED";
        currentRequest.passingGrade = true;
        sendUpdate();
    }

    function sendReject(){
        currentRequest.benCoStatus = "REJECTED";
        sendUpdate();
    }

    function sendUpdate(){
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = resolve;
        xhr.open("PUT","r/grade");
        xhr.setRequestHeader("Content-Type","application/json;charset=utf-8");
        xhr.send(JSON.stringify(currentRequest));

        function resolve(){
            if (xhr.readyState === 1){
                textContainer.innerText = "Sending confirmation...";
                actionsContainer.style.visibility = "hidden";
                return;
            }
            if (xhr.readyState === 4){
                if (xhr.status === 204){
                    textContainer.innerText = "Confirmation sent.";
                    newElement = document.createElement("button");
                    newElement.type = "button";
                    newElement.innerText = "Return to Main Menu";
                    actionsContainer.innerHTML = "";
                    actionsContainer.style.visibility = "initial";
                    actionsContainer.appendChild(newElement);
                    newElement.onclick = setupMainMenu;
                } else {
                    textContainer.innerText = "Failed to send confirmation - status code "+xhr.status;
                    actionsContainer.style.visibility = "initial";
                }
            }
        }
    } 
}

function confirmPresentation(){
    let buttons = document.getElementById("buttons");
    buttons.style.display = "none";
    let confirmContainer = document.getElementById("confirm-warning");
    let textContainer = document.createElement("p");
    textContainer.innerText = "Was presentation completed in a satisfactory manner?";
    confirmContainer.appendChild(textContainer);
    let actionsContainer = document.createElement("div");
    confirmContainer.appendChild(actionsContainer);
    newElement = document.createElement("br");
    actionsContainer.appendChild(newElement);
    newElement = document.createElement("button");
    newElement.type = "button";
    newElement.innerText = "Cancel";
    actionsContainer.appendChild(newElement);
    newElement.onclick = restorePreviousOptions;
    newElement = document.createElement("button");
    newElement.type = "button";
    newElement.innerText = "Yes";
    actionsContainer.appendChild(newElement);
    newElement.onclick = sendApprove;
    newElement = document.createElement("button");
    newElement.type = "button";
    newElement.innerText = "No";
    actionsContainer.appendChild(newElement);
    newElement.onclick = sendReject;

    function restorePreviousOptions(){
        confirmContainer.innerHTML = "";
        buttons.style.display = "initial";
    }

    function sendApprove(){
        currentRequest.supervisorStatus = "APPROVED";
        sendUpdate();
    }

    function sendReject(){
        currentRequest.supervisorStatus = "REJECTED";
        sendUpdate();
    }

    function sendUpdate(){
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = resolve;
        xhr.open("PUT","r/grade");
        xhr.setRequestHeader("Content-Type","application/json;charset=utf-8");
        xhr.send(JSON.stringify(currentRequest));

        function resolve(){
            if (xhr.readyState === 1){
                textContainer.innerText = "Sending confirmation...";
                actionsContainer.style.visibility = "hidden";
                return;
            }
            if (xhr.readyState === 4){
                if (xhr.status === 204){
                    textContainer.innerText = "Confirmation sent.";
                    newElement = document.createElement("button");
                    newElement.type = "button";
                    newElement.innerText = "Return to Main Menu";
                    actionsContainer.innerHTML = "";
                    actionsContainer.style.visibility = "initial";
                    actionsContainer.appendChild(newElement);
                    newElement.onclick = setupMainMenu;
                } else {
                    textContainer.innerText = "Failed to send confirmation - status code "+xhr.status;
                    actionsContainer.style.visibility = "initial";
                }
            }
        }
    } 
}

function confirmPassingGrade(){
    let buttons = document.getElementById("buttons");
    buttons.style.display = "none";
    let confirmContainer = document.getElementById("confirm-warning");
    let textContainer = document.createElement("p");
    textContainer.innerText = "Send confirmation of passing grade?";
    confirmContainer.appendChild(textContainer);
    let actionsContainer = document.createElement("div");
    confirmContainer.appendChild(actionsContainer);
    let newElement = document.createElement("input");
    newElement.type = "file";
    actionsContainer.appendChild(newElement);
    newElement = document.createElement("br");
    actionsContainer.appendChild(newElement);
    newElement = document.createElement("button");
    newElement.type = "button";
    newElement.innerText = "Cancel";
    actionsContainer.appendChild(newElement);
    newElement.onclick = restorePreviousOptions;
    newElement = document.createElement("button");
    newElement.type = "button";
    newElement.innerText = "Confirm";
    actionsContainer.appendChild(newElement);
    newElement.onclick = sendPassingGrade;

    function restorePreviousOptions(){
        confirmContainer.innerHTML = "";
        buttons.style.display = "initial";
    }

    function sendPassingGrade(){
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = resolve;
        xhr.open("PUT","r/grade");
        xhr.setRequestHeader("Content-Type","application/json;charset=utf-8");
        xhr.send(JSON.stringify(currentRequest));

        function resolve(){
            if (xhr.readyState === 1){
                textContainer.innerText = "Sending confirmation...";
                actionsContainer.style.visibility = "hidden";
                return;
            }
            if (xhr.readyState === 4){
                if (xhr.status === 204){
                    textContainer.innerText = "Confirmation sent.";
                    newElement = document.createElement("button");
                    newElement.type = "button";
                    newElement.innerText = "Return to Main Menu";
                    actionsContainer.innerHTML = "";
                    actionsContainer.style.visibility = "initial";
                    actionsContainer.appendChild(newElement);
                    newElement.onclick = setupMainMenu;
                } else {
                    textContainer.innerText = "Failed to send confirmation - status code "+xhr.status;
                    actionsContainer.style.visibility = "initial";
                }
            }
        }
    }
}

function getMaxAmount(){
    if (maxAmount != null) return;
    getInfo("max",initializeMax);

    function initializeMax(maxAmt){
        if (maxAmt != null){
            maxAmount = parseFloat(maxAmt);
        }
    }
}

function getReimbursementRates(){
    if (reimbursementRates != null) return;
    getInfo("rates",initializeRates);

    function initializeRates(rates){
        if (rates != null){
            reimbursementRates = JSON.parse(rates);
        }
    }
}

function getStatusName(name){
    let delayedStatus = false;
    if (statusNames == null) {
        delayedStatus = true;
        getInfo("status",initializeStatusNames);
    }
    while(delayedStatus && name != undefined){}

    if (name == undefined) return null;
    else return statusNames[name];

    function initializeStatusNames(newStatusNames){
        if (newStatusNames != null) {
            statusNames = JSON.parse(newStatusNames);
        }
        delayedStatus = false;
    }
}

function getShortStatusName(thisRequest){
    let statusName = "Unknown";
    if (thisRequest == null) return statusName;
    if (thisRequest.benCoStatus == 'CANCELLED') return getStatusName('CANCELLED');
    if (thisRequest.supervisorStatus == 'PENDING' || thisRequest.deptHeadStatus == 'PENDING' || thisRequest.benCoStatus == 'PENDING'){
        statusName = getStatusName('PENDING');
    }
    if (thisRequest.supervisorStatus == 'REQ_ACTION' || thisRequest.deptHeadStatus == 'REQ_ACTION' || thisRequest.benCoStatus == 'REQ_ACTION'){
        statusName = getStatusName('REQ_ACTION');
        return statusName;
    }
    if (thisRequest.supervisorStatus == 'MGR_ACTION' || thisRequest.deptHeadStatus == 'MGR_ACTION'){
        statusName = getStatusName('MGR_ACTION');
        return statusName;
    }
    if (thisRequest.supervisorStatus == 'CONFIRM_PASS' || thisRequest.benCoStatus == 'CONFIRM_PASS'){
        statusName = getStatusName('CONFIRM_PASS');
        return statusName;
    }
    if (thisRequest.benCoStatus == 'REJECTED' || thisRequest.deptHeadStatus == 'REJECTED' || thisRequest.supervisorStatus == 'REJECTED'){
        statusName = getStatusName('REJECTED');
        return statusName;
    }
    if (thisRequest.supervisorStatus == 'APPROVED' && thisRequest.deptHeadStatus == 'APPROVED' && thisRequest.benCoStatus == 'APPROVED'){
        if (thisRequest.passingGrade) statusName = getStatusName('APPROVED');
        else statusName = "Approved, waiting for pass confirmation";
    }
    return statusName;
}

function commentSendMenu(){
    let comment = {"sender": employee};
    let recipients;
    let multiSelector = false;
    if (currentRequest.supervisorStatus == 'REQ_ACTION'){
        recipients = [currentRequest.requester.supervisor];
    } else if (currentRequest.deptHeadStatus == 'REQ_ACTION'){
        recipients = [currentRequest.requester.departmentHead];
    } else if (currentRequest.benCoStatus == 'REQ_ACTION' || currentRequest.supervisorStatus == 'MGR_ACTION' || currentRequest.deptHeadStatus == 'MGR_ACTION'){
        recipients = [currentRequest.attachedComments[0].sender];
    } else {
        if (currentRequest.requester.id == employee.id) return;
        recipients = [currentRequest["requester"]];
        multiSelector = true;
    };
    console.log(recipients);
    document.getElementById("buttons").style.display = "none";
    let newComment = document.getElementById("new-comment");
    let newElement;
    let selector;
    let commentText;
    if (multiSelector){
        if (currentRequest.requester.supervisor != null && employee.id != currentRequest.requester.supervisor.id){
            if (employeeLevels.isDepartmentHead || employeeLevels.isBenefitsCoordinator) recipients.push(currentRequest.requester.supervisor);
        }
        if (currentRequest.requester.departmentHead != null && employee.id != currentRequest.requester.departmentHead.id && employeeLevels.isBenefitsCoordinator){
            recipients.push(currentRequest.requester.departmentHead);
        }
    }
    let isMenuPresent = (recipients.length > 1);

    if (isMenuPresent) createOptions();
    else {
        newElement = document.createElement("p");
        newElement.innerText="Send comment to "+recipients[0].fullname;
        newComment.appendChild(newElement);
    }

    commentText = document.createElement("textarea");
    commentText.rows = "5";
    commentText.style.width = "80%";
    newComment.appendChild(commentText);

    newElement = document.createElement("br");
    newComment.appendChild(newElement);
    let statusField = document.createElement("p");
    newComment.appendChild(statusField);


    let buttonsContainer = document.createElement("div");
    newComment.appendChild(buttonsContainer);

    newElement = document.createElement("button");
    newElement.type = "button";
    newElement.innerText = "Go Back";
    buttonsContainer.appendChild(newElement);
    newElement.onclick = restorePreviousOptions;

    let sendButton = document.createElement("button");
    sendButton.type = "button";
    sendButton.innerText = "Send Comment";
    buttonsContainer.appendChild(sendButton);
    sendButton.onclick = commentSender;

    function commentSender(){
        sendButton.onclick = null;
        comment["text"] = commentText.value;
        if (isMenuPresent) comment["recipient"] = recipients[selector.value];
        else comment["recipient"] = recipients[0];
        comment["associatedReimbursement"] = currentRequest;
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = resolve;
        xhr.open("POST","r/comment");
        xhr.setRequestHeader("Content-Type","application/json;charset=utf-8");
        xhr.send(JSON.stringify(comment));

        function resolve(){
            if (xhr.readyState === 1){
                statusField.innerText="Sending comment";
                return;
            }
            if (xhr.readyState === 4){
                if (xhr.status === 201) {
                    statusField.innerText="Comment successfully added";
                    buttonsContainer.innerHTML="";
                    newElement = document.createElement("button");
                    newElement.innerText = "Return to Main Screen";
                    buttonsContainer.appendChild(newElement);
                    newElement.onclick=setupMainMenu;
                } else {
                    statusField.innerText="Failed to add new comment. Server sent status "+xhr.status;
                    sendButton.onclick = commentSender;           
                }
            }
        }
    }
    

    function createOptions(){
        let optionName;
        newElement = document.createElement("label");
        newElement.htmlFor = "choose";
        newElement.innerText = "Select a recipient: ";
        newComment.appendChild(newElement);
        selector = document.createElement("select");
        selector.name = "choose";
        for (let i in recipients){
            optionName = document.createElement("option");
            optionName.value = i;
            optionName.innerText = recipients[i].fullname;
            selector.appendChild(optionName);
        }
        newComment.appendChild(selector);
        newElement = document.createElement("br");
        newComment.appendChild(newElement);
    }

    function restorePreviousOptions(){
        newComment.innerHTML = "";
        document.getElementById("buttons").style.display = "initial";
    }
}

function fillComments(){
    let commentsContainer = document.getElementById("comments-container");
    if (currentRequest.attachedComments == null || currentRequest.attachedComments.length == 0) {
        commentsContainer.style.display = "none";
        return;
    }
    let currentCommentContainer;
    let internalBox;
    let arrowIcon;
    document.getElementById("comments-headline").innerHTML="Comments History";
    for ( let thisComment of currentRequest.attachedComments ){
        currentCommentContainer = document.createElement("div");
        currentCommentContainer.className = "comment";
        internalBox = document.createElement("div");
        internalBox.innerText = `From: ${thisComment["sender"]["fullname"]}  To: ${thisComment["recipient"]["fullname"]}  ${niceDateTime(new Date(thisComment["time"]))}`;
        currentCommentContainer.appendChild(internalBox);
        internalBox = document.createElement("div");
        if (thisComment["text"].length > 40) internalBox.innerText = thisComment["text"].substring(0,40);
        else internalBox.innerText = thisComment["text"];
        currentCommentContainer.appendChild(internalBox);
        arrowIcon = document.createElement("div");
        arrowIcon.className = "dropdown-arrow";
        arrowIcon.innerText = "▼";
        currentCommentContainer.appendChild(arrowIcon);
        internalBox = document.createElement("div");
        internalBox.className = "comment-fulltext";
        internalBox.innerText = thisComment["text"];
        currentCommentContainer.appendChild(internalBox);
        internalBox.style.height = "0";
        commentsContainer.appendChild(currentCommentContainer);
        arrowIcon.onclick = openComments;
        arrowIcon.style.cursor = "pointer";
    }
    function openComments(){
        let thisIcon = event.currentTarget;
        thisIcon.innerText = "▲";
        let parentContainer = thisIcon.parentNode;
        parentContainer.childNodes[1].innerHTML="";
        parentContainer.childNodes[3].style.height = "auto";
        parentContainer.childNodes[2].onclick = closeComments;
    }
    function closeComments(){
        let thisIcon = event.currentTarget;
        thisIcon.innerText = "▼";
        let parentContainer = thisIcon.parentNode;
        parentContainer.childNodes[1].innerHTML=(parentContainer.childNodes[3].innerHTML.length > 40) ? parentContainer.childNodes[3].innerHTML.substring(0,40) : parentContainer.childNodes[3].innerHTML;
        parentContainer.childNodes[3].style.height = "0";
        parentContainer.childNodes[2].onclick = openComments;
    }

}

function getReimbursementTypeName(keyName){
    if (reimbursementTypes == null){
        getInfo("rtypes", fillList);
    } else {
        return resolve();
    }

    function fillList(names){
        if (names) {
            reimbursementTypes = JSON.parse(names);
            return resolve();
        } else return null;
    }
    
    function resolve(){
        if (keyName === undefined) return null;
        else return reimbursementTypes[keyName];
    }
    return null;
}

function getGradingFormatName(keyName){
    if (gradingFormats == null){
        getInfo("gformats", fillList);
    } else {
        return resolve();
    }

    function fillList(names){
        if (names) {
            gradingFormats = JSON.parse(names);
            return resolve();
        } else return;
    }
    
    function resolve(){
        if (keyName === undefined) return null;
        return gradingFormats[keyName];
    }
}

function confirmApprovalStatusChange(statusChange){
    document.getElementById("buttons").style.display = "none";
    let confirmText = document.createElement("p");
    confirmText.innerHTML = "Do you really want to "+statusChange+" this request?";
    let buttonContainer = document.createElement("div");
    let forwardButton = document.createElement("button");
    forwardButton.innerHTML = statusChange.substring(0,1).toUpperCase() + statusChange.substring(1);
    let backButton = document.createElement("button");
    backButton.innerHTML = "Cancel";
    let confirmWarning = document.getElementById("confirm-warning");
    confirmWarning.appendChild(confirmText);
    buttonContainer.appendChild(forwardButton);
    buttonContainer.appendChild(backButton);
    confirmWarning.appendChild(buttonContainer);
    backButton.onclick = restorePreviousOptions;
    forwardButton.onclick = approvalStatusChange;
    
    function restorePreviousOptions(){
        confirmWarning.innerHTML = "";
        document.getElementById("buttons").style.display = "initial";
    }

    function updateCurrentReimbursementStatus(){
        // can't approve own request
        if (currentRequest["requester"]["id"] === employee["id"]) return true;
        let newStatus;
        let isSupervisor = false;
        let id;
        if (statusChange === "approve") newStatus = "APPROVED";
        else {
            if (statusChange == "reject") newStatus = "REJECTED";
            else newStatus = "PENDING";
        }
        if (currentRequest["requester"]["supervisor"]) id = currentRequest["requester"]["supervisor"]["id"];
        else id = "";
        if ( id === employee["id"]){
            currentRequest["supervisorStatus"] = newStatus;
            isSupervisor = true;
        }
        if (currentRequest["requester"]["departmentHead"]) id = currentRequest["requester"]["departmentHead"]["id"];
        else id = "";
        if (id === employee["id"]){
            currentRequest["deptHeadStatus"] = newStatus;
            isSupervisor = true;
        }
        // supervisor or department head for benefits coordinators can't also approve their requests as one
        if (isSupervisor) return false;
        currentRequest["benCoStatus"] = newStatus;
        return false;
    }

    function approvalStatusChange(){
        if (updateCurrentReimbursementStatus()) return;
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = confirmUpdate;
        xhr.open("PUT","r");
        xhr.setRequestHeader("Content-Type","application/json;charset=utf-8");
        xhr.send(JSON.stringify(currentRequest));

        function confirmUpdate(){
            if (xhr.readyState === 1){
                confirmText.innerHTML="Updating request...";
                buttonContainer.style.visibility = "hidden";
                return;
            }
            if (xhr.readyState === 4){
                let backButton = document.createElement("button");
                backButton.type = "button";
                let newContainer = document.createElement("div");
                newContainer.appendChild(backButton);

                if (xhr.status === 200 || xhr.status === 204){
                    confirmText.innerHTML="Request record successfully updated.";
                    backButton.innerHTML = "Return to Main Screen";
                    backButton.onclick = setupMainMenu;
                } else {
                    confirmText.innerHTML="Error: server returned status code "+xhr.status;                  
                    backButton.innerHTML = "Go Back";             
                    backButton.onclick = restorePreviousOptions;
                }
                confirmWarning.replaceChild(newContainer,confirmWarning.childNodes[1]);
            }
        }
    }
}

function displayPendingApproval(){
    if (menuScreen !== viewRequestScreen) return;
    displayRequest();
    document.getElementById("goback").onclick=setupPendingApprovalsScreen;
    let buttons = document.getElementById("buttons");
    if (currentRequest.supervisorStatus != "CONFIRM_PASS" && currentRequest.benCoStatus != "CONFIRM_PASS"){
        let approve = document.createElement("button");
        approve.type = "button";
        approve.innerHTML = "Approve Request"
        buttons.appendChild(approve);
        let reject = document.createElement("button");
        reject.type = "button";
        reject.innerHTML = "Reject Request";
        buttons.appendChild(reject);
        let sendComment = document.createElement("button");
        sendComment.type = "button";
        sendComment.innerHTML = "Comment";
        buttons.appendChild(sendComment);
        approve.addEventListener("click",() => {confirmApprovalStatusChange("approve");});
        reject.addEventListener("click",() => {confirmApprovalStatusChange("reject");});
        sendComment.addEventListener("click", commentSendMenu);
    }
}

function pendingApprovalMoreInfo(){
    let tagId = event.currentTarget.id;
    if (tagId.search("request-") !== 0) {
        console.error("Unexpected tag "+tagId);
        return;
    } else {
        tagId = tagId.slice(8);
        currentRequest = currentRequestList[tagId];
        getMenu("s/thisrequest.html",viewRequestScreen,displayPendingApproval);
    }   
}

function setupPendingApprovalsList(requests){
    if (requests == null) {
        console.log("Nothing received");
        // to do: handle error getting list
    } else {
        let pendingTable = document.getElementById("pending-approval").getElementsByTagName("tbody")[0];
        currentRequestList = requests;
        let newRow;
        let newColumn;
        let ed;
        let lat;
        for ( let n in currentRequestList ){
            newRow = document.createElement("tr");
            // name and date of event
            newColumn = document.createElement("td");
            ed=new Date(currentRequestList[n]["eventDate"]);
            newColumn.innerHTML=`${currentRequestList[n]["requester"]["fullname"]} ${niceDate(ed)}`;
            newRow.appendChild(newColumn);
            // status
            newColumn = document.createElement("td");
            newColumn.innerHTML=`${getShortStatusName(currentRequestList[n])}`;
            newRow.appendChild(newColumn);
            newColumn = document.createElement("td");
            // last action time
            lat = new Date(currentRequestList[n]["lastActionTime"]);
            newColumn.innerHTML=niceDateTime(lat);
            newRow.appendChild(newColumn);
            // urgent
            newColumn = document.createElement("td");
            newColumn.innerHTML = (currentRequestList[n]["urgent"] == true) ? "⚠" : "-";
            newRow.appendChild(newColumn);
            // more info button
            newColumn = document.createElement("td");
            newColumn.innerHTML = "Details";
            newColumn.className = "more-info";
            newColumn.id = "request-"+n;
            newColumn.addEventListener("click",pendingApprovalMoreInfo);
            newRow.appendChild(newColumn);
            pendingTable.appendChild(newRow);
        }
    }
}

function setupPendingApprovalsScreen(){
    getMenu("s/pendingapproval.html", pendingApprovalsScreen, resolve);
    let benCoOk = true;
    let supervisorOk = true;
    let deptHeadOk = true;
    let pendingRequests = [];
    function resolve(){
        if (menuScreen !== pendingApprovalsScreen) return;
        document.getElementById("goback").onclick = setupMainMenu;
        if (employeeLevels.isManager){
            getRequests("approve",synchM);
            supervisorOk = false;
        }
        if (employeeLevels.isDepartmentHead){
            getRequests("dh",synchD);
            deptHeadOk = false;
        }
        if (employeeLevels.isBenefitsCoordinator){
            getRequests("benco",synchB);
            benCoOk = false;
        }
    }
    function synchM(req){
        pendingRequests = pendingRequests.concat(req);
        supervisorOk = true;
        synch();
    }
    function synchD(req){
        pendingRequests = pendingRequests.concat(req);
        deptHeadOk = true;
        synch();
    }
    function synchB(req){
        pendingRequests = pendingRequests.concat(req);
        benCoOk = true;
        synch();
    }

    function synch(){
        if (benCoOk && supervisorOk && deptHeadOk) setupPendingApprovalsList(pendingRequests);
    }
}

function niceDateTime(timestamp){
    let minutes = timestamp.getMinutes();
    return niceDate(timestamp)+` ${timestamp.getHours()}:${(minutes < 10) ? "0" : ""}${minutes}`;
}

function niceDate(timestamp){
    return `${timestamp.getFullYear()}/${timestamp.getMonth()+1}/${timestamp.getDate()}`;
}

function displayPendingRequest(){
    if (menuScreen !== viewRequestScreen) return;
    displayRequest();
    document.getElementById("goback").onclick=setupPendingRequestsScreen;
}

function displayRequest(){
    document.getElementById("requester-name").innerHTML=currentRequest.requester.fullname;
    document.getElementById("request-time").innerHTML=niceDateTime(new Date(currentRequest.requestTime));
    document.getElementById("last-action-time").innerHTML=niceDateTime(new Date(currentRequest.lastActionTime));
    document.getElementById("reimbursement-type").innerHTML=getReimbursementTypeName(currentRequest.reimbursementType);
    document.getElementById("tuition-amount").innerHTML="$"+currentRequest.tuitionAmount;
    document.getElementById("reimbursement-rate").innerHTML=currentRequest.reimbursementRate+"%";
    document.getElementById("event-location").innerHTML=currentRequest.eventLocation;
    document.getElementById("grading-format").innerHTML=getGradingFormatName(currentRequest.gradingFormat);
    document.getElementById("event-date").innerHTML=niceDate(new Date(currentRequest.eventDate));
    document.getElementById("description").innerHTML=currentRequest.description;
    document.getElementById("explanation").innerHTML=currentRequest.explanation;
    document.getElementById("supervisor-status").innerHTML=getStatusName(currentRequest.supervisorStatus);
    document.getElementById("depthead-status").innerHTML=getStatusName(currentRequest.deptHeadStatus);
    document.getElementById("benco-status").innerHTML=getStatusName(currentRequest.benCoStatus);
    document.getElementById("passing-grade").innerHTML=(currentRequest.passingGrade ? "Yes" : "No");
    if (currentRequest.benCoStatus != 'APPROVED' && currentRequest.benCoStatus != 'CONFIRM_PASS'){
        document.getElementById("approved-text").innerHTML="Projected Reimbursement";
    }
    document.getElementById("approved-amount").innerHTML=currentRequest.approvedAmount;
    let alteredStatus = currentRequest.amountAltered;
    document.getElementById("amount-altered").innerHTML=(alteredStatus ? "Yes" : "No");
    if (alteredStatus) {
        document.getElementById("alteration-reason").innerHTML=currentRequest.alterationReason;
    } else {
        document.getElementById("alteration-reason-row-1").style.visibility = "collapse";
        document.getElementById("alteration-reason-row-2").style.visibility = "collapse";
    }
    fillComments();
    if (currentRequest.supervisorStatus == 'REQ_ACTION' || currentRequest.deptHeadStatus == 'REQ_ACTION' || currentRequest.benCoStatus == 'REQ_ACTION'){
        let commentButton = document.createElement("button");
        commentButton.type = "button";
        commentButton.innerText = "Respond to Comment";
        document.getElementById("buttons").appendChild(commentButton);
        commentButton.onclick = commentSendMenu;
    }
    if (employee.id == currentRequest.requester.id && currentRequest.supervisorStatus == 'APPROVED' && currentRequest.deptHeadStatus == 'APPROVED' && currentRequest.benCoStatus == 'APPROVED' && currentRequest.passingGrade == false){
        let confirmCompletionButton = document.createElement("button");
        confirmCompletionButton.type = "button";
        confirmCompletionButton.innerText = "Confirm Event Completion";
        document.getElementById("buttons").appendChild(confirmCompletionButton);
        confirmCompletionButton.onclick = confirmPassingGrade;
    }
    if ( employeeLevels.isManager && currentRequest.supervisorStatus == 'CONFIRM_PASS' && currentRequest.requester.supervisor != null && employee.id == currentRequest.requester.supervisor.id){
        let confirmPresentationButton = document.createElement("button");
        confirmPresentationButton.type = "button";
        confirmPresentationButton.innerText = "Confirm Successful Presentation";
        document.getElementById("buttons").appendChild(confirmPresentationButton);
        confirmPresentationButton.onclick = confirmPresentation;
    }
    if ( employeeLevels.isBenefitsCoordinator && employee.id != currentRequest.requester.id && 
            (currentRequest.requester.supervisor == null || employee.id != currentRequest.requester.supervisor.id) &&
             ( currentRequest.requester.departmentHead == null || employee.id != currentRequest.requester.departmentHead.id)){
        if (currentRequest.benCoStatus == 'CONFIRM_PASS'){
            let confirmPassButton = document.createElement("button");
            confirmPassButton.type = "button";
            confirmPassButton.innerText = "Confirm Successful Completion";
            document.getElementById("buttons").appendChild(confirmPassButton);
            confirmPassButton.onclick = confirmPass;
        } else if (currentRequest.benCoStatus == 'PENDING'){
            let modifyReimbursementButton = document.createElement("button");
            modifyReimbursementButton.type = "button";
            modifyReimbursementButton.innerText = "Modify Reimbursement Amount";
            document.getElementById("buttons").appendChild(modifyReimbursementButton);
            modifyReimbursementButton.onclick = modifyReimbursement;
        }
    }
}

function pendingRequestMoreInfo(){
    let tagId = event.currentTarget.id;
    if (tagId.search("request-") !== 0) {
        console.error("Unexpected tag "+tagId);
        return;
    } else {
        tagId = tagId.slice(8);
        currentRequest = currentRequestList[tagId];
        getMenu("s/thisrequest.html",viewRequestScreen,displayPendingRequest);
    }
}

function setupRequestsList(requests){
    if (requests == null) {
        console.log("Nothing received");
        // to do: handle error getting list
    } else {
        let thisTable = document.getElementById("requests").getElementsByTagName("tbody")[0];
        currentRequestList = requests;
        let newRow;
        let newColumn;
        let ed;
        let lat;
        for ( let n in currentRequestList ){
            newRow = document.createElement("tr");
            newColumn = document.createElement("td");
            ed=new Date(currentRequestList[n]["eventDate"]);
            newColumn.innerHTML=`${currentRequestList[n]["eventLocation"]} ${niceDate(ed)}`;
            newRow.appendChild(newColumn);
            newColumn = document.createElement("td");
            newColumn.innerHTML=`${getShortStatusName(currentRequestList[n])}`;
            newRow.appendChild(newColumn);
            newColumn = document.createElement("td")
            lat = new Date(currentRequestList[n]["lastActionTime"]);
            newColumn.innerHTML=niceDateTime(lat);
            newRow.appendChild(newColumn);
            newColumn = document.createElement("td");
            newColumn.innerHTML = "Details";
            newColumn.className = "more-info";
            newColumn.id = "request-"+n;
            newColumn.addEventListener("click",pendingRequestMoreInfo);
            newRow.appendChild(newColumn);
            thisTable.appendChild(newRow);
        }
    }
}

function setupPendingRequestsScreen(){
    getMenu("s/requests.html", pendingRequestsScreen, resolve);
    function resolve(){
        if (menuScreen !== pendingRequestsScreen) return;
        document.getElementById("title").innerText = "Your Pending Requests";
        document.getElementById("goback").onclick = setupMainMenu;
        getRequests("pending",setupRequestsList);
    }
}

function setupAllRequestsScreen(){
    getMenu("s/requests.html", allRequestsScreen, resolve);
    function resolve(){
        if (menuScreen !== allRequestsScreen) return;
        document.getElementById("title").innerText = "Your Requests";
        document.getElementById("goback").onclick = setupMainMenu;
        getRequests("all",setupRequestsList);
    }
}

function submitReimbursement(){
    if (reimbursementRequestInfo == null) {
        console.error("No request to submit.");
        return;
    }
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = checkSubmissionStatus;
    xhr.open("POST","r");
    xhr.setRequestHeader("Content-Type","application/json;charset=utf-8");
    xhr.send(JSON.stringify(reimbursementRequestInfo));

    function checkSubmissionStatus(){
        if (xhr.readyState === 4){
            if (xhr.status === 201){
                reimbursementRequestInfo = null;
                setupMainMenu();
            } else {
                console.error("Server sent error "+xhr.status);
            }
        }
    }
}

function createReimbursementRequest(){
    let reimbursementTypeValue = document.getElementById("reimbursement-type").value;
    let tuitionAmtValue = document.getElementById("tuition-amount").value;
    let gradingFormatValue = document.getElementById("grading-format").value;
    let eventLocationValue = document.getElementById("event-location").value;
    let eventBeginDateValue = document.getElementById("event-begin-date").value;
    let eventDescriptionValue = document.getElementById("event-description").value;
    let explanationValue = document.getElementById("explanation").value;

    reimbursementRequestInfo = {
        "reimbursementType": reimbursementTypeValue,
        "tuitionAmount": tuitionAmtValue,
        "gradingFormat": gradingFormatValue,
        "eventLocation": eventLocationValue,
        "eventDate": eventBeginDateValue,
        "description": eventDescriptionValue,
        "explanation": explanationValue
    }

    getMenu("s/confirmscreen.html", submitConfirmScreen, resolve);

    function resolve() {
        if (menuScreen !== submitConfirmScreen) return;
        document.getElementById("rtv").innerHTML = getReimbursementTypeName(reimbursementTypeValue);
        document.getElementById("tav").innerHTML = tuitionAmtValue;
        document.getElementById("gfv").innerHTML = getGradingFormatName(gradingFormatValue);
        document.getElementById("elv").innerHTML = eventLocationValue;
        document.getElementById("ebdv").innerHTML = eventBeginDateValue;
        document.getElementById("edv").innerHTML = eventDescriptionValue;
        document.getElementById("ev").innerHTML = explanationValue;
        document.getElementById("goback").onclick = setupReimbursementMenu;
        document.getElementById("confirm").onclick = submitReimbursement;
    }
}

function setupMainMenu(){
    getMenu("s/mainmenu.html", mainMenu, resolve);
    function resolve(){
        if (menuScreen !== mainMenu) return;
        getGradingFormatName();
        getReimbursementTypeName();
        getStatusName();
        getReimbursementRates();
        getMaxAmount();
        document.getElementById("make-request").onclick = setupReimbursementMenu;
        document.getElementById("view-pending").onclick = setupPendingRequestsScreen;
        document.getElementById("view-all").onclick = setupAllRequestsScreen;
        let approvalsButton = document.getElementById("view-approval");
        if (employeeLevels.isManager || employeeLevels.isDepartmentHead || employeeLevels.isBenefitsCoordinator) {
            approvalsButton.onclick = setupPendingApprovalsScreen;
        } else {
            approvalsButton.style.display = "none";
        }
    }
}

function setupReimbursementMenu(){
    getMenu("s/reimbursement.html", newReimbursement, resolve);
    let reimbursementType;
    let gradingFormat;
    let projectedAmtElement;
    let tuitionAmtElement;
    function resolve(){
        if (menuScreen !== newReimbursement) return;
        reimbursementType = document.getElementById("reimbursement-type");
        gradingFormat = document.getElementById("grading-format");
        if (gradingFormats) setupGradingDropdown();
        else getInfo("gformats",setupGradingDropdown);
        if (reimbursementTypes) setupReimbursementTypeDropdown();
        else getInfo("rtypes",setupReimbursementTypeDropdown);
        let submitButton = document.getElementById("submit-reimbursement");
        submitButton.onclick = createReimbursementRequest;
        projectedAmtElement = document.getElementById("projected-amt");
        tuitionAmtElement = document.getElementById("tuition-amount");
        reimbursementType.onchange = updateProjectedAmount;
        tuitionAmtElement.onchange = updateProjectedAmount;
    }

    function updateProjectedAmount(){
        if (tuitionAmtElement.value.length == 0){
            projectedAmtElement.innerText = "";
            return;
        }
        if (tuitionAmtElement.value.search("^[0-9]+(\\.[0-9]{1,2})?$") == -1){
            projectedAmtElement.innerText = "You must enter a number."
            return;
        }
        if (!reimbursementRates || !maxAmount) {
            projectedAmtElement.innerText = "";
            return;
        }
        let ta = parseFloat(tuitionAmtElement.value);
        let rt = reimbursementType.value;
        let rr = parseFloat(reimbursementRates[rt]);
        let reg = Math.round (ta * rr) / 100;
        projectedAmtElement.innerText = `Projected tuition reimbursement: ${(maxAmount < reg) ? maxAmount : reg}`;
    }

    function setupGradingDropdown(dropdownOptions){
        if (dropdownOptions === null){
            console.error("Failed to retrieve grading formats from server");
            return;
        }
        if (dropdownOptions !== undefined) gradingFormats = JSON.parse(dropdownOptions);

        for ( let i in gradingFormats ){
            gradingFormat.innerHTML += `
            <option value="${i}">${gradingFormats[i]}</option>
            `
        }
    }

    function setupReimbursementTypeDropdown(dropdownOptions){
        if (dropdownOptions === null){
            console.error("Failed to retrieve reimbursement types from server");
            return;
        }
        if (dropdownOptions !== undefined) reimbursementTypes = JSON.parse(dropdownOptions);

        for ( let i in reimbursementTypes ){
            reimbursementType.innerHTML += `
            <option value="${i}">${reimbursementTypes[i]}</option>
            `
        }
    }
}

function getMenu(htmlAddress, screenNumber, doOnCompletion){
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = getDynamicContent;
    xhr.open("GET",htmlAddress);
    xhr.send();

    function getDynamicContent(){
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 304){
                appMain.innerHTML = xhr.response;
                menuScreen = screenNumber;
            } else {
                appMain = errorOccurred;
                menuScreen = errorOccurredScreen;
            }
            doOnCompletion();
        }
    }
}

function getInfo(infoType, doOnCompletion){
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = getRequestedInfo;
    xhr.open("GET","info/"+infoType);
    xhr.send();

    function getRequestedInfo(){
        if (xhr.readyState === 4){
            if (xhr.status === 200){
                doOnCompletion(xhr.responseText);
            } else {
                doOnCompletion(null);
            }
        }
    }
}

function getRequests(requestType, doOnCompletion){
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = getRequestedInfo;
    xhr.open("GET","r/"+requestType);
    xhr.send();

    function getRequestedInfo(){
        if (xhr.readyState === 4){
            if (xhr.status === 200){
                doOnCompletion(JSON.parse(xhr.responseText));
            } else {
                doOnCompletion(null);
            }
        }
    }
}