

var mailGateway = 'https://2q42g4lcu7.execute-api.eu-central-1.amazonaws.com/Dev/registerParticipants/events'
var codeDecryptorGateway = 'https://2q42g4lcu7.execute-api.eu-central-1.amazonaws.com/Dev/codedecrypt'
var eventsGateway = 'https://2q42g4lcu7.execute-api.eu-central-1.amazonaws.com/Dev/admin/events'
var eventGateway = 'https://2q42g4lcu7.execute-api.eu-central-1.amazonaws.com/Dev/registerParticipants/event'
var successPage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/register-now/views/successPage.html'
var registerPage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/register-now/views/registerPage.html'
var blankPage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/register-now/views/blank.html'
var doneRegisterPage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/register-now/views/doneRegister.html'
var createEventsPage = 'https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/register-now/views/createEventsPage.html'
var userPoolId = 'eu-central-1_SuB9dVBXm'
var clientId = '248kh5c5nrsj81o81svacvj9un'
var cognitoPage = 'https://amg-registerevents.auth.eu-central-1.amazoncognito.com/login?client_id=248kh5c5nrsj81o81svacvj9un&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/register-now/views/blank.html'
var adminCognitoPage = 'https://amg-register-events-admin.auth.eu-central-1.amazoncognito.com/login?client_id=68s5v9esjup95d699krd2svqr4&response_type=code&scope=aws.cognito.signin.user.admin+email+openid&redirect_uri=https://amg-event-registration-bucket.s3.eu-central-1.amazonaws.com/register-now/views/adminBlank.html'


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
        xhttp.setRequestHeader('who', 'participant')
        xhttp.send()
        localStorage.setItem('tokens', tokens)
        tokens = JSON.parse(tokens)
        console.log(tokens)
        if(tokens['error']){
            window.location.href = cognitoPage
        }else{
            window.location.href = registerPage
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
function callMailApiGateway(){
    tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    eventId = document.getElementById('elementEventId').innerHTML
    var xhttp = new XMLHttpRequest()
    xhttp.open("GET", mailGateway)
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            resp = this.responseText
            resp = JSON.parse(resp)
            if(resp.message == 'participant already exists') {
                window.location.href = doneRegisterPage
            }else{
                window.location.href = successPage
            }
        }
    }
    xhttp.setRequestHeader("Authorization", tokens['id_token'])
    xhttp.setRequestHeader('event_id', eventId)
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

function getRegisterPage() {
    var tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    if(tokens == null || tokens['error']){
        window.location.href = cognitoPage
    }else{
        var events = getEvents()
        events = JSON.parse(events)
        for(let i=0; i < events.length; i++) {
            displayEvents(events[i])
        }
        inalert()
    }
}

function getEvents() {
    tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    var events
    var xhttp = new XMLHttpRequest()
    xhttp.open('GET', eventsGateway, false)
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            events = this.responseText
        }   
    }
    xhttp.setRequestHeader('Authorization', tokens['id_token'])
    xhttp.send()
    return events
}

function displayEvents(event) {
    var div = document.createElement('div')
    div.textContent = event.event_name
    div.setAttribute('class', 'events')
    div.setAttribute('id', event.event_id)
    div.onclick = function() {
        getEvent(event.event_id)
    }
    document.body.appendChild(div)
}

function getSuccessPage() {
    var tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    if(tokens == null || tokens['error']){
        window.location.href = cognitoPage
    }else{
        document.getElementById('successDiv').style.display = 'block'
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

function openCognito() {
    window.location.href = cognitoPage
}

function openAdminCognito() {
    window.location.href = adminCognitoPage
}

function makeEvent() {
    var eventName = document.getElementById('eventname').value
    var location = document.getElementById('location').value
    var startDate = document.getElementById('startdate').value
    var endDate = document.getElementById('enddate').value
    var experience = document.getElementById('experience').value
    var cars = document.getElementById('cars').value
    var level = document.getElementById('level').value

    body = {
        'body' : {
            'event_name': eventName,
            'location': location,
            'start_date': startDate,
            'end_date': endDate,
            'experience': experience,
            'cars': cars,
            'level': level
        }
    }
    body = JSON.stringify(body)
    adminTokens = localStorage.getItem('adminTokens')
    adminTokens = JSON.parse(adminTokens)
    var xhttp = new XMLHttpRequest()
    xhttp.open('POST', eventsGateway)
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            makeElementsNull()
        }
    }
    xhttp.setRequestHeader('Authorization', adminTokens['id_token'])
    xhttp.setRequestHeader('Content-type', 'application/json')
    xhttp.send(body)
}

function makeElementsNull() {
    document.getElementById('eventname').value = ''
    document.getElementById('location').value = ''
    document.getElementById('startdate').value = ''
    document.getElementById('enddate').value = ''
    document.getElementById('experience').value = ''
    document.getElementById('cars').value = ''
    document.getElementById('level').value = ''
}

function getAlreadyRegisteredPage() {
    var tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    if(tokens == null || tokens['error']){
        window.location.href = cognitoPage
    }else{
        document.getElementById('alreadyRegisteredDiv').style.display = 'block'
        inalert()
    }
}

function checkCreateEventsPage() {
    var adminTokens = localStorage.getItem('adminTokens')
    adminTokens = JSON.parse(adminTokens)
    if(adminTokens == null || adminTokens['error']){
        window.location.href = adminCognitoPage
    }else{
        document.getElementById('outerBox').style.display = 'block'
        inalert()
    }
}

function decryptAdminCode() {
    var code = onLoad()
    if(code == null){
        window.location.href = adminCognitoPage
    }else{
        var xhttp = new XMLHttpRequest()
        xhttp.open('GET', codeDecryptorGateway, false)
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                adminTokens = this.responseText
            }
        }
        xhttp.setRequestHeader('code', code)
        xhttp.setRequestHeader('who', 'admin')
        xhttp.send()
        localStorage.setItem('adminTokens', adminTokens)
        adminTokens = JSON.parse(adminTokens)
        if(adminTokens['error']){
            window.location.href = adminCognitoPage
        }else{
            window.location.href = createEventsPage
        }
    }
}

function getEvent(eventId) {
    tokens = localStorage.getItem('tokens')
    tokens = JSON.parse(tokens)
    var xhttp = new XMLHttpRequest()
    xhttp.open('GET', eventGateway)
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            resp = this.responseText
            resp = JSON.parse(resp)
            var event = resp['event'][0]
            fillEvent(event)
        }
    }
    xhttp.setRequestHeader('Authorization', tokens['id_token'])
    xhttp.setRequestHeader('event_id', eventId)
    xhttp.send()
}

function fillEvent(event) {
    document.getElementById('elementEventId').innerHTML = event['event_id']
    document.getElementById('elementEventName').innerHTML = event['event_name']
    document.getElementById('elementEventLocation').innerHTML = event['location']
    document.getElementById('elementEventStartDate').innerHTML = event['start_date']
    document.getElementById('elementEventEndDate').innerHTML = event['end_date']
    document.getElementById('elementEventExperience').innerHTML = event['experience']
    document.getElementById('elementEventCars').innerHTML = event['cars']
    document.getElementById('elementEventLevel').innerHTML = event['level']
    window.scrollTo(0, 0)
    document.getElementById('getEventPage').style.display = 'block'
    document.getElementById('registerBody').style.overflow = "hidden"
}

function closeGetEvent() {
    document.getElementById('registerBody').style.overflow = "visible"
    document.getElementById('getEventPage').style.display = 'none'
}
