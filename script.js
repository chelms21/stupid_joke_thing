// List of subreddits to pull from
const SUBREDDITS = [
    'Jokesuncensored',
    'cursedmemes',
    'holup', // Added popular dark humor sub
    'darkhumorandmemes'
];

/**
 * Checks if a post URL is a direct image link (JPEG, PNG).
 * @param {string} url - The URL of the post.
 * @returns {boolean} True if it's a direct image link.
 */
function isImage(url) {
    return (/\.(jpe?g|png|gif|webp)$/i).test(url);
}

/**
 * Fetches a random image post from a random subreddit in the list.
 */
async function fetchRandomMeme() {
    const loadingMessage = document.getElementById('loading-message');
    const memeImage = document.getElementById('meme-image');
    const memeTitle = document.getElementById('meme-title');

    // Display loading state
    loadingMessage.textContent = 'Fetching meme... Please wait.';
    memeImage.style.display = 'none';
    memeTitle.textContent = '';

    try {
        // 1. Pick a random subreddit
        const randomSubreddit = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
        const redditUrl = `https://www.reddit.com/r/${randomSubreddit}/hot.json?limit=50`; 
        // We use /hot.json?limit=50 to get a batch of recent, active posts.

        // 2. Fetch the JSON data from Reddit's public API
        const response = await fetch(redditUrl);
        const data = await response.json();

        // 3. Filter the posts for direct image links
        const imagePosts = data.data.children.filter(post => {
            const postData = post.data;
            // Check for direct image URL and not a video or gallery
            return isImage(postData.url_overridden_by_dest) && !postData.is_video && postData.post_hint === 'image';
        });

        if (imagePosts.length === 0) {
            loadingMessage.textContent = `Could not find a recent image meme in r/${randomSubreddit}. Trying again.`;
            // Recursively call itself to try another subreddit/batch
            return fetchRandomMeme();
        }

        // 4. Select a random image post from the filtered list
        const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)].data;
        const imageUrl = randomPost.url_overridden_by_dest;
        const titleText = randomPost.title;

        // 5. Update the HTML elements
        memeImage.src = imageUrl;
        memeImage.alt = titleText;
        memeTitle.textContent = titleText;
        
        // The image has an onload event to hide the loading message once it's actually loaded
        memeImage.onload = () => {
            loadingMessage.textContent = '';
            memeImage.style.display = 'block';
        };

        // Fallback for image load error
        memeImage.onerror = () => {
             loadingMessage.textContent = `Error loading image from r/${randomSubreddit}. Trying again.`;
             // Recursively call itself on error to try a different post
             return fetchRandomMeme();
        }

    } catch (error) {
        console.error('Error fetching Reddit data:', error);
        loadingMessage.textContent = 'Failed to fetch meme. Check the console for details.';
    }
}

// Optional: Automatically load a meme when the page first loads
document.addEventListener('DOMContentLoaded', fetchRandomMeme);
