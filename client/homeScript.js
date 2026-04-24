let currentPage = 1
let lastPage = 1

//================ Infinite Scrool ================//
window.addEventListener("scroll", function() {
    const endOfPage = window.innerHeight + window.pageYOffset  >= document.body.offsetHeight
    //let endOfPage = window.innerHeight + window.scrollY  >= document.body.scrollHeight
    // console.log(endOfPage)
    if (endOfPage && currentPage < lastPage){
        currentPage = currentPage + 1
        getPosts(false,currentPage )
    }
} )

setupUI()

getPosts()



async function getPosts(reload = true,page = 1) {
    try {
        let response = await fetch(baseUrl+`/posts?limit=15&page=${page}`)
        const data = await response.json() 
        const Posts = data.data ;
        //console.log(data.meta.last_page )
        lastPage = data.meta.last_page 
        //console.log(Posts)
        if ( reload  ){
            document.getElementById("posts").innerHTML = ""
        }
        // document.getElementById("posts").innerHTML = ""
        for ( Post of Posts ){
            const author = Post.author;
            let postTitle = ""

            let user = getCurrentUser()
            
            let isMyPost = user != null && user.id == Post.author.id

            let editButtonDisplay = ``

            if ( isMyPost ){
                editButtonDisplay = `
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-danger" onclick="ConfirmDeletePostClicked('${encodeURIComponent(JSON.stringify(Post))}')">Delete</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(Post))}')">Edit</button>
                    </div>
                `
            }
            if ( Post.title != null ){
                postTitle = Post.title ;
            }
            //console.log(Post.tags)
            
            // console.log(Post.image);
            const postImage = Post.image 
            const profileImage = author.profile_image || "./placeholder/standard_profile_picture.png"
            
            let content =  `
                <article class="card post-card">
                    <div class="card-header post-header">
                        <div class="post-author">
                            <img class="avatar-sm" src="${profileImage}" alt="${author.username}">
                            <span>@${author.username}</span>
                        </div>
                        ${editButtonDisplay}
                    </div>
                    <div class="card-body post-body" onclick="postClicked('${Post.id}')"> 
                        <img class="post-image" src="${postImage}" ${postImage ? '' : 'hidden'} alt="Post image">
                        <p class="post-time">${timeAgo(Post.created_at)}</p>
                        <h5 class="post-title">${postTitle}</h5>
                        <p class="post-text">${Post.body}</p>
                        <div class="post-footer">
                            <span class="comments-pill">(${Post.comments_count}) Comments</span>
                            <span class="tags-wrap" id="post-tags-${Post.id}"></span>
                        </div>
                    </div>
                </article>
            `
            document.getElementById("posts").innerHTML += content

            const currentPostTagsId = `post-tags-${Post.id}`

            document.getElementById(currentPostTagsId).innerHTML = ""

            for ( tag of Post.tags ) {
                // console.log(tag.name)
                let tagsContent = `
                    <span class="tag-pill">
                        ${tag.name}
                    </span>
                `
                document.getElementById(currentPostTagsId).innerHTML += tagsContent
            }
        }
        
        return data
    }
    catch(error) {
        console.error('Could not get user data:', error);
    }
}


function CreateNewPostClicked(){
    let postId = document.getElementById("post-id-input").value
    let isCreate =  postId == null || postId == "false" || postId == "" 
    // console.log(isCreate)
    

    const title = document.getElementById("post-title-input").value
    const body = document.getElementById("post-body-input").value       // .value ki yebda input naw3ouu text 
    const image = document.getElementById("post-image-input").files[0]     // .files hiya function w ahna hachetna ken b file loul hetheka a3lech khtarna .files[0]
    const token = localStorage.getItem("token")

    let formData = new FormData()                   // nesta3mlou el form data ki hachetna b file donc nbadlou el params b formdata

    formData.append("body",body)
    formData.append("title",title)
    formData.append("image",image)
    
    let url = ""
    
    const headers = {
        "content-Type": "multipart/form-data",      // hethi zeda nektbopuha khater kbal kena nab3athou json ama taw formData so lezemna nkoloulou
        "authorization" : `Bearer ${token}`
    }

    if ( isCreate ){
        url = baseUrl+"/posts" ;
        
    }else {
        formData.append("_method","put")     // 7ata n3aytou lel update method 7asb rest api convention lezemna n3aytou lel method put ama 7asb el backend implementation ken yest3mlou post m3a _method put aw ken yest3mlou put direct

        url = baseUrl+`/posts/${postId}`
    }

    axios.post(url,formData, {
        headers : headers
    } )
    .then(function (response) {
        // console.log(response);
        const modal =  document.getElementById("create-post-Modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        showAlert("New Post Has Benn Created")
        getPosts()
        setupUI()
    })
    .catch(function (error) {
        const message = error.response.data.message 
        showAlert(message, "danger")
        //console.log(error);
    });

}

function postClicked(postId){
    console.log(postId)

    window.location = `postDetails.html?postId=${postId}`
}

function editPostBtnClicked(postObject){
    // alert("edit")
    // alert(postId)
    let post = JSON.parse(decodeURIComponent(postObject))
    // console.log(post)
    document.getElementById("post-id-input").value = post.id
    document.getElementById("post-modal-title").innerHTML = "Edit Post"
    document.getElementById("create-post-btn").innerHTML = "Update"
    document.getElementById("post-title-input").value = post.title
    document.getElementById("post-body-input").value = post.body
    let postModal = new bootstrap.Modal(document.getElementById("create-post-Modal"), {

    })
    postModal.toggle()
}

function addPostClicked(){
    
    document.getElementById("post-id-input").value = ""
    document.getElementById("post-modal-title").innerHTML = "Create A New Post"
    document.getElementById("create-post-btn").innerHTML = "Create"
    let postModal = new bootstrap.Modal(document.getElementById("create-post-Modal"), {

    })
    postModal.toggle()
}

function ConfirmDeletePostClicked(PostObject){

    let postModal = new bootstrap.Modal(document.getElementById("delete-post-Modal"), {

    })
    let post = JSON.parse(decodeURIComponent(PostObject))
    document.getElementById("delete-post-id").value = post.id

    postModal.toggle()
}

function confirmPostDeletion(){

    const postId = document.getElementById("delete-post-id").value

    const url = baseUrl+`/posts/${postId}` ;
    
    
    const token = localStorage.getItem("token")

    const headers = {
        "authorization" : `Bearer ${token}`
    }

    axios.delete(url, {
        headers : headers
    } )
    .then(function (response) {
        console.log(response);
        
        // bech yetsaker el login modal wakt yenjah login
        const modal =  document.getElementById("delete-post-Modal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        showAlert("Post deleted successfully","success")
        getPosts()
    })
    .catch(function (error) {
        const message = error.response.data.message 
        showAlert(message, "danger")
        //console.log(error);
    });
}

