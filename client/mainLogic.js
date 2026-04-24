// const baseUrl = 'https://tarmeezacademy.com/api/v1';
 //const baseUrl = 'http://localhost:8800/api';
const baseUrl = 'https://dailyfeed-as93.onrender.com/api';

function setupUI() {
    const token = localStorage.getItem("token")
    // console.log(token)
    
    const loginBtn = document.getElementById("login-btn")
    const registerBtn = document.getElementById("register-btn")
    const logoutBtn = document.getElementById("logout-btn")
    const userDiv = document.getElementById("user-div")
    const addBtn = document.getElementById("add-btn")

    if ( token == null ){       // user is guest( not logged in)
        loginBtn.style.display = "block"
        registerBtn.style.display = "block"
        logoutBtn.style.display = "none"
        userDiv.style.setProperty("display","none","important")
        if ( addBtn != null ){
            addBtn.style.setProperty("display","none","important")
        }
        
    }else { // for logged in user
        loginBtn.style.display = "none"
        registerBtn.style.display = "none"
        logoutBtn.style.display = "block"
        userDiv.style.setProperty("display","flex","important")
        if ( addBtn != null ){
            addBtn.style.setProperty("display","block","important")
        }
        const user = getCurrentUser()
        
        document.getElementById("nav-username").innerHTML = "@" + user.username
        document.getElementById("nav-user-image").src = user.profile_image
        
    }
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return count === 1
        ? `1 ${interval.label} ago`
        : `${count} ${interval.label}s ago`;
    }
  }

  return "just now";
}

function refreshPageAfterAuth() {
    window.location.reload()
}

function LoginBtnClicked() {
    const email = document.getElementById("email-input").value
    const password = document.getElementById("password-input").value
    
    const params = {
        "email" : email,
        "password" : password
    }

    const url = baseUrl+"/auth/login" ;

    axios.post(url,params )
    .then(function (response) {
        //console.log(response.data.token);
        localStorage.setItem("token",response.data.token)
        localStorage.setItem("user",JSON.stringify(response.data.user))     // khater el user hoa json so lezemna nsaviwh ka string  

        //console.log(response.data.user.profile_image)

        // bech yetsaker el login modal wakt yenjah login
        const modal =  document.getElementById("login-Modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        showAlert("user logged in successfully","success")
        setupUI()
        refreshPageAfterAuth()
    })
    .catch(function (error) {
        const message = error.response.data.message 
        showAlert(message, "danger")
        //console.log(error);
    });

}

function RegisterBtnClicked() {

    const url = baseUrl+"/auth/register" ;

    const email =  document.getElementById("register-email-input").value
    const username = document.getElementById("register-username-input").value
    const password =document.getElementById("register-password-input").value
    const image = document.getElementById("register-image-input").files[0]

    let formData = new FormData()

    formData.append("username",username)
    formData.append("email",email)
    formData.append("password",password)
    formData.append("profile_image",image)

   
    
    const headers = {
        "content-Type": "multipart/form-data"
    }

    axios.post(url,formData, {
        headers: headers
    } )
    .then(function (response) {
        console.log(response);
        localStorage.setItem("token",response.data.token)
        localStorage.setItem("user",JSON.stringify(response.data.user))     // khater el user hoa json so lezemna nsaviwh ka string  

        // bech yetsaker el login modal wakt yenjah login
        const modal =  document.getElementById("register-Modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        showAlert("New user Registred in successfully", "success")
        setupUI()
        refreshPageAfterAuth()
    })
    .catch(function (error) {
        console.log(error);
        const message = error.response.data.message 
        showAlert(message, "danger")
        //console.log(error);
    });
}

function logout(){
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showAlert("logged out successfully", "success")
    setupUI()
    refreshPageAfterAuth()
}


function showAlert(customMessage,type="success") {
    const alertPlaceholder = document.getElementById('success-alert')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
    }

    appendAlert(customMessage, type)

    // todo : hetha bech nsakrou el alert
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance('#success-alert')
        // alert.close()
    }, 2000);      
}


function getCurrentUser(){
    let user = null
    const storageUser = localStorage.getItem("user")

    if ( storageUser != null ){
        user = JSON.parse(storageUser)
    }

    return user 
}