let perPage = 10; // Number of repositories per page
let currentPage = 1;
let totalRepos = 1;
let originalReposData = [];


async function fetchUser() {
    showLoadingSpinner()
    const username = 'AdhyanTiwari';
    const userApiUrl = `https://api.github.com/users/${username}`;
    try {
        const userResponse = await fetch(userApiUrl);
        const userData = await userResponse.json();
        totalRepos = userData.public_repos;
        displayUser(userData);
        fetchRepos();
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    finally {
        hideLoadingSpinner()
    }
}

async function fetchRepos() {
    showLoadingSpinner()
    const username = 'AdhyanTiwari';
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        originalReposData = data;
        displayRepos(data);
    } catch (error) {
        console.error('Error fetching repositories:', error);
    }
    finally {
        hideLoadingSpinner()
    }
}

async function fetchRepoTopics(owner, repoName) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/topics`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        return data.names || [];
    } catch (error) {
        console.error('Error fetching repository topics:', error);
        return [];
    }
}

async function displayUser(user) {
    const profileImage = document.getElementById('profile-image');
    profileImage.src = user.avatar_url;

    const userInfoContainer = document.getElementById('user-info');
    userInfoContainer.innerHTML = `<h4><b>${user.login}</b></h4>
                                       <p>${user.bio || 'No bio available.'}</p>
                                       <p>Followers: ${user.followers} | Following: ${user.following}</p>`;
}

async function displayRepos(repos) {
    const reposContainer = document.getElementById('repos');
    reposContainer.innerHTML = '';


    for (const repo of repos) {
        const repoOutside = document.createElement("div");
        repoOutside.classList.add("col-md-6")
        const repoItem = document.createElement('div');
        repoItem.classList.add("repo-item", "mb-3", "p-3");

        const repoTopics = await fetchRepoTopics(repo.owner.login, repo.name);
        const topicsHTML = repoTopics.map(topic => `<span class="badge badge-primary">${topic}</span>`).join(' ');

        repoItem.innerHTML = `<h6><b>${repo.name}</b></h6>
                                  <p>${repo.description || 'No description available.'}</p>
                                  <p>${topicsHTML}</p>
                                  <a href="${repo.html_url}" target="_blank">View on GitHub</a>`;

        repoOutside.appendChild(repoItem);
        reposContainer.appendChild(repoOutside);
    }

    renderPagination();
}

function renderPagination() {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination');
    const username = 'AdhyanTiwari'; // Replace with the desired GitHub username
    const userApiUrl = `https://api.github.com/users/${username}`;

    const totalPages = Math.ceil(totalRepos / perPage);

    for (let i = 1; i <= totalPages; i++) { // Assuming there are 10 pages, you can adjust this based on your needs
        const pageLink = document.createElement('a');
        pageLink.textContent = i;
        pageLink.addEventListener('click', () => {
            currentPage = i;
            fetchRepos();
        });

        if (i === currentPage) {
            pageLink.style.backgroundColor = 'rgb(91, 11, 166)';
        }

        paginationContainer.appendChild(pageLink);
    }

    document.getElementById('repos').appendChild(paginationContainer);
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeBtn = document.getElementById('dark-mode-btn');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        darkModeBtn.style.backgroundColor = '#333';
        darkModeBtn.style.color = '#fff';
        darkModeBtn.textContent = 'Light Mode';
    } else {
        darkModeBtn.style.backgroundColor = '#fff';
        darkModeBtn.style.color = '#333';
        darkModeBtn.textContent = 'Dark Mode';
    }
}

function changeReposPerPage() {
    const select = document.getElementById('reposPerPage');
    perPage = parseInt(select.value, 10);
    currentPage = 1; // Reset to the first page when changing the number of repositories per page
    fetchRepos();
}

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}
function filterRepos() {
    const searchTerm = document.getElementById('repoSearch').value.toLowerCase();
    const filteredRepos = originalReposData.filter(repo => repo.name.toLowerCase().includes(searchTerm));

    displayRepos(filteredRepos);
}

fetchUser();