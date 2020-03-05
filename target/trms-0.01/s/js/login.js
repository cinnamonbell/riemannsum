window.onload = addNavBar;

let navbar = `
<nav>
    <a class = "logo">
        TRMS
    </a>
    <ul class="login" id="auth">
    </ul>
</nav>
`;

let unauthenticated = `
<li class="nav-login">
    Username: <input type="text" id="username">
</li>
<li class="nav-login">
    Password: <input type="password" id="password">
</li>
<li class="nav-login">
    <button type="button" class="login-button" id="login">Login</button>
</li>
`;

let authenticated = `
<li class="nav-login">
Logged in as: <span id="navname" class="fullname"></span>
</li>
<li class="nav-login">
<button type="button" class="login-button" id="logout">Logout</button>
</li>
`;

let logoutDisplay = `
<br>
<h2>You have successfully logged out.</h2>
`;

employee = null;
employeeLevels = null;

base = 'employee/';

function setUnauthenticated() {
    document.getElementById('auth').innerHTML = unauthenticated;
    document.getElementById('login').onclick = authenticate;
    employeeLevels = null;
    document.getElementById('password').onkeydown = function(){
        if (event.which === 13) authenticate();
    }
}

function setAuthenticated() {
    document.getElementById('auth').innerHTML = authenticated;
    document.getElementById('logout').onclick = logout;
    getEmployeeLevels();
}

function getEmployeeLevels(){
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = resolve;
    xhr.open("GET","info/elevels");
    xhr.send();

    function resolve(){
        if (xhr.readyState === 4){
            if (xhr.status === 200){
                employeeLevels = JSON.parse(xhr.responseText);
                setupMainMenu();
            } else {
                console.error("Received response "+xhr.status+" from server while attempting to fetch employee levels");
                logout();
            }
        }
    }
}

function addNavBar() {
    let body = document.getElementsByTagName('body')[0];
    let div = document.createElement('div');
    div.innerHTML = navbar;
    body.insertBefore(div, body.childNodes[0]);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = getLogin;
    xhttp.open('GET', base + 'login');
    xhttp.send();

    function getLogin() {
        if ( xhttp.readyState === 4 ) {
            if ( xhttp.status === 200 ) {
                employee = JSON.parse(xhttp.responseText);
                fullname = employee.fullname;
                setAuthenticated();
                document.getElementById('navname').innerHTML = fullname;                
            }
            else setUnauthenticated();
        }
    }
}

function authenticate() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = tryLogin;
    xhttp.open('POST', base + 'login');
    xhttp.setRequestHeader('Content-type',
			'application/x-www-form-urlencoded');
    let user = document.getElementById('username').value;
    let pass = document.getElementById('password').value;
    xhttp.send('user=' + user + '&password=' + pass);

    function tryLogin() {
        if ( xhttp.readyState === 4 && xhttp.status === 200 ) {
            employee = JSON.parse(xhttp.responseText);
            fullname = employee.fullname;
            setAuthenticated();
            document.getElementById('navname').innerHTML = fullname;
        }
    }
}

function logout() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = tryLogout;
    xhttp.open('DELETE',base + 'login');
    xhttp.send();
    function tryLogout(){
        if ( xhttp.readyState === 4 && xhttp.status === 204 ) {
            setUnauthenticated();
            employee = null;
            maxAmount = null;
            currentRequest = null;
            currentRequestList = null;
            document.getElementById("appmain").innerHTML = logoutDisplay;
        }
    }
}
