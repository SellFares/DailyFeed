setupUI();
loadProfilePage();

async function loadProfilePage() {
    const currentUser = getCurrentUser();
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get("userId") || (currentUser ? currentUser.id : null);

    if (!profileId) {
        document.getElementById("profile-posts-list").innerHTML = `
            <article class="card post-card">
                <div class="card-body post-body" style="cursor: default;">
                    <p class="post-text mb-0">You need to login first to view a profile.</p>
                </div>
            </article>
        `;
        return;
    }

    try {
        const [profileResponse, postsResponse] = await Promise.all([
            axios.get(`${baseUrl}/users/${profileId}`),
            axios.get(`${baseUrl}/users/${profileId}/posts`)
        ]);

        const profile = profileResponse.data.data;
        const posts = postsResponse.data.data || [];
        

        renderProfileSummary(profile);
        renderProfilePosts(profile, posts);
    } catch (error) {
        const message = error?.response?.data?.message || "Could not load profile data";
        showAlert(message, "danger");
        document.getElementById("profile-posts-list").innerHTML = `
            <article class="card post-card">
                <div class="card-body post-body" style="cursor: default;">
                    <p class="post-text mb-0">Could not load profile right now.</p>
                </div>
            </article>
        `;
    }
}

function renderProfileSummary(profile) {
    const profileImage = profile.profile_image ;

    document.getElementById("profile-image").src = profileImage;
    document.getElementById("profile-name").textContent = profile.username;
    document.getElementById("profile-username").textContent = `${profile.email}`;
    document.getElementById("profile-posts-count").textContent = profile.posts_count || 0;
    document.getElementById("profile-comments-count").textContent = profile.comments_count || 0;
    document.getElementById("profile-posts-title").textContent = `${profile.username} Posts`;
}

function renderProfilePosts(profile, posts) {
    const postsContainer = document.getElementById("profile-posts-list");

    if (!posts.length) {
        postsContainer.innerHTML = `
            <article class="card post-card">
                <div class="card-body post-body" style="cursor: default;">
                    <p class="post-text mb-0">No posts yet for this profile.</p>
                </div>
            </article>
        `;
        return;
    }

    let content = "";

    for (const post of posts) {
        const postImage = post.image ;
        const title = post.title || "Untitled";
        const tags = Array.isArray(post.tags) ? post.tags : [];

        let tagsContent = "";
        for (const tag of tags) {
            tagsContent += `<span class="tag-pill">${tag.name}</span>`;
        }

        content += `
            <article class="card post-card">
                <div class="card-header post-header">
                    <div class="post-author">
                        <img class="avatar-sm" src="${profile.profile_image || "./placeholder/1.jpg"}" alt="${profile.username}">
                        <div>
                            <strong style="color: var(--text-main);">@${profile.username}</strong>
                            
                        </div>
                    </div>
                </div>
                <div class="card-body post-body" onclick="openPostDetails('${post.id}')">
                    <img class="post-image" src="${postImage}" ${postImage ? '' : 'hidden'} alt="Post image">
                    <p class="post-time">${timeAgo(post.created_at)}</p>
                    <h5 class="post-title">${title}</h5>
                    <p class="post-text">${post.body}</p>
                    <div class="post-footer">
                        <span class="comments-pill">(${post.comments_count}) Comments</span>
                        <span class="tags-wrap">${tagsContent}</span>
                    </div>
                </div>
            </article>
        `;
    }

    postsContainer.innerHTML = content;
}

function openPostDetails(postId) {
    window.location = `postDetails.html?postId=${postId}`;
}
