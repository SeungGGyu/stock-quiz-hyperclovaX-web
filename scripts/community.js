function renderPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';  // Clear existing content

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', post.id);

        // Navigate to post details when clicking the card (except delete button)
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

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.className = 'delete-button';
        deleteButton.style.marginTop = '10px';
        deleteButton.onclick = function(event) {
            event.stopPropagation(); // Prevent card click event
            deletePost(post.id);
        };

        card.appendChild(title);
        card.appendChild(content);
        card.appendChild(footer);
        card.appendChild(deleteButton);  // Add delete button to card

        postsContainer.appendChild(card);
    });
}

// Function to delete a post
function deletePost(postId) {
    posts = posts.filter(post => post.id !== postId);
    localStorage.setItem('posts', JSON.stringify(posts));  // Update localStorage
    renderPosts();  // Re-render posts after deletion
}

// Load posts from localStorage when the page loads
window.onload = function() {
    let storedPosts = JSON.parse(localStorage.getItem('posts'));
    if (storedPosts) {
        posts = storedPosts;
    }
    renderPosts();
};
