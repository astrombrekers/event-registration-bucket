
//glabal variables
var id_token = ''
var apiGateway = 'https://2q42g4lcu7.execute-api.eu-central-1.amazonaws.com/Dev/registerParticipants'
var codeDecryptorGateway = 'https://2q42g4lcu7.execute-api.eu-central-1.amazonaws.com/Dev/codedecrypt'
var checkAuthGateway = 'https://kxxntcl1d0.execute-api.eu-central-1.amazonaws.com/test/checkAuth'
var successPage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/successPage.html'
var failurePage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/failure.html'
var logOutPage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/logOut.html'
var indexPage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/indexPage.html'
var blankPage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/blank.html'
var userPoolId = 'eu-central-1_SuB9dVBXm'
var clientId = '248kh5c5nrsj81o81svacvj9un'
var cognitoPage = 'https://amg-registerevents.auth.eu-central-1.amazoncognito.com/login?client_id=248kh5c5nrsj81o81svacvj9un&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/blank.html'

//function to decrypt the authorization code to tokens
function decryptCode() {
    var code = onLoad()
    if(code == null){
        window.location.href = cognitoPage
    }else{
        var xhttp = new XMLHttpRequest()
        xhttp.open('GET', codeDecryptorGateway, false)
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                tokens = this.responseText
            }
        }
        xhttp.setRequestHeader('code', code)
        xhttp.send()
        localStorage.setItem('tokens', tokens)
        tokens = JSON.parse(tokens)
        if(tokens['error']){
            window.location.href = cognitoPage
        }else{
            window.location.href = indexPage
        }
    }
}

//function to extract tokens from hash from url
function onLoad(){
    var urlParams = new URLSearchParams(location.search)
    var code = urlParams.get('code')
    return code
}

//function to call api gateway of aws
function callApiGateway(){
    window.location.href = successPage
    tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    var xhttp = new XMLHttpRequest()
    xhttp.open("POST", apiGateway)
    xhttp.setRequestHeader("Authorization", tokens['id_token'])
    xhttp.send()
}

//function to authorize success page via gateway
function openSuccess() {
    tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    var privatePageGateway = 'https://2q42g4lcu7.execute-api.eu-central-1.amazonaws.com/Dev/test/successPage.html'
    var xhttp = new XMLHttpRequest()
    xhttp.open('GET', privatePageGateway)
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
        }
    }
    xhttp.setRequestHeader('Authorization', tokens['id_token'])
    xhttp.send()
}


//function to logout the current user from AWS cognito
function logOut() {
    var poolData = { 
        UserPoolId : userPoolId,
        ClientId : clientId
    }
    var userPool = new AWS.cognitoUser(poolData)
    var cognitoUser = userPool.getCurrentUser()
    console.log(cognitoUser, 'signing out...')
    cognitoUser.signOut()
    window.location.href = logOutPage
}

//function which authenticates success page
function successLoad() {
    if(localStorage.getItem('page') == 'successPage'){
        if(navigator.userAgent == localStorage.getItem('browser') && localStorage.getItem('Authorized') == 'true'){
            document.getElementById('successDiv').style.visibility = "visible"
            document.getElementById('failureDiv').remove()
            document.getElementById('notAuthDiv').remove()
        }
    } else if(localStorage.getItem('page') == 'failurePage') {
        if(navigator.userAgent == localStorage.getItem('browser') && localStorage.getItem('Authorized') == 'false'){
            document.getElementById('failureDiv').style.visibility = "visible"
            document.getElementById('notAuthDiv').remove()
            document.getElementById('successDivDiv').remove()
        }
    } else {
        document.getElementById('notAuthDiv').style.visibility = "visible"
        document.getElementById('successDiv').remove()
        document.getElementById('failureDiv').remove()
    }
    timeout()
}

//function to perform timeout operation after 10s
function timeout() {
    setTimeout(function(){
        localStorage.clear()
        console.log('done')
    }, 10000)
}

//function to set header
function setHeader() {
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.open("GET", window.location.href, false)
    xmlHttp.setRequestHeader("auth",'true')
    xmlHttp.send(null)
}

//function to get header
function checkHeader() {
    setHeader()
    var req = new XMLHttpRequest()
    req.open('GET', window.location.href, false)
    req.send(null)
}

function showIndex() {
    var tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    if(tokens == null || tokens['error']){
        window.location.href = cognitoPage
    }else{
        document.getElementById('indexBody').style.display = 'block'
        console.log(tokens['id_token'])
        inalert()
    }
}

function getSuccessPage() {
    var tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    if(tokens == null || tokens['error']){
        window.location.href = cognitoPage
    }else{
        document.getElementById('successDiv').style.visibility = 'visible'
        inalert()
    }
}

function inalert(){
    var time
    time = setTimeout(logout, 3600000)
    window.onload = resetTimer
    document.onmousemove = resetTimer
    document.onkeydown = resetTimer

    function logout() {
        localStorage.clear()
        window.location.href = cognitoPage
    }

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(logout, 3600000)
    }
}

function signOut() {
    localStorage.clear()
    window.location.href = cognitoPage
}