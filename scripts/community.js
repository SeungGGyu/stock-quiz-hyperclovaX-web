function renderPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = ''; 

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', post.id);

        // 글을 클릭하면 글에 대해서 자세히 볼 수 있는 페이지로 감
        card.onclick = function(event) {
            if (!event.target.classList.contains('delete-button')) {
                window.location.href = `post.html?id=${post.id}`;
            }
        };

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = post.title;

        const content = document.createElement('div');
        content.className = 'card-content';
        content.textContent = post.content;

        const footer = document.createElement('div');
        footer.className = 'card-footer';
        footer.innerHTML = `${post.date} | 댓글 ${post.comments.length} | 좋아요 ${post.likes}`;

    
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.className = 'delete-button';
        deleteButton.style.marginTop = '10px';
        deleteButton.onclick = function(event) {
            event.stopPropagation(); //
            deletePost(post.id);
        };

        card.appendChild(title);
        card.appendChild(content);
        card.appendChild(footer);
        card.appendChild(deleteButton);  

        postsContainer.appendChild(card);
    });
}

//삭제 구현
function deletePost(postId) {
    posts = posts.filter(post => post.id !== postId);
    localStorage.setItem('posts', JSON.stringify(posts));  
    renderPosts();  
}

window.onload = function() {
    let storedPosts = JSON.parse(localStorage.getItem('posts'));
    if (storedPosts) {
        posts = storedPosts;
    }
    renderPosts();
};
