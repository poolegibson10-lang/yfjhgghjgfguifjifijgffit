
const $ = id => document.getElementById(id);

let videos = [
  {
    id: 1,
    title: "Amazing Gaming Moments",
    channel: "Gaming Channel",
    category: "gaming",
    description: "Check out these amazing gaming moments!",
    thumbnail: "https://picsum.photos/500/280?random=1",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    likes: 0,
    dislikes: 0,
    views: 1200,
    isShort: false,
    comments: []
  },
  {
    id: 2,
    title: "Best Music Mix",
    channel: "Music World",
    category: "music",
    description: "Enjoy this music collection.",
    thumbnail: "https://picsum.photos/500/280?random=2",
    url: "https://www.w3schools.com/html/movie.mp4",
    likes: 0,
    dislikes: 0,
    views: 900,
    isShort: false,
    comments: []
  },
  {
    id: 3,
    title: "Funny Video Compilation",
    channel: "Funny Videos",
    category: "funny",
    description: "Funny videos to make your day!",
    thumbnail: "https://picsum.photos/500/280?random=3",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    likes: 0,
    dislikes: 0,
    views: 2500,
    isShort: false,
    comments: []
  },
  {
    id: 4,
    title: "Minecraft Gameplay",
    channel: "Game Studio",
    category: "gaming",
    description: "Watch some Minecraft gameplay.",
    thumbnail: "https://picsum.photos/500/280?random=4",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    likes: 0,
    dislikes: 0,
    views: 5000,
    isShort: false,
    comments: []
  }
];

let currentVideo = null;
let currentChannel = "";
let currentFilter = "all";
let historyVideos = [];
let likedVideos = [];
let subscribedChannels = [];
let playlists = [];
let notifications = [];
let currentPlaylist = null;
let profileName = "Your Channel";

// Load saved data
try {
  const saved = JSON.parse(localStorage.getItem("ytCloneData"));

  if (saved) {
    videos = saved.videos || videos;
    historyVideos = saved.historyVideos || [];
    likedVideos = saved.likedVideos || [];
    subscribedChannels = saved.subscribedChannels || [];
    playlists = saved.playlists || [];
    notifications = saved.notifications || [];
    profileName = saved.profileName || "Your Channel";
  }
} catch (error) {
  console.warn("Could not load saved data:", error);
}

function saveData() {
  try {
    localStorage.setItem("ytCloneData", JSON.stringify({
      videos,
      historyVideos,
      likedVideos,
      subscribedChannels,
      playlists,
      notifications,
      profileName
    }));
  } catch (error) {
    alert("Storage is full. Large video files cannot be saved locally. Use a backend for permanent uploads.");
  }
}

// Page navigation
function showPage(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.hidden = true;
  });

  const target = $(page);

  if (target) target.hidden = false;

  if (page === "home") displayVideos(videos);
  if (page === "shorts") displayShorts();
  if (page === "trending") displayTrending();
  if (page === "subscriptions") displaySubscriptions();
  if (page === "history") displayHistory();
  if (page === "liked") displayLiked();
  if (page === "profile") displayProfile();
  if (page === "playlists") displayPlaylists();
  if (page === "notifications") displayNotifications();

  window.scrollTo(0, 0);
}

function toggleSidebar() {
  $("sidebar").classList.toggle("closed");
}

// Theme
function toggleTheme() {
  document.body.classList.toggle("light");

  localStorage.setItem(
    "ytCloneTheme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

if (localStorage.getItem("ytCloneTheme") === "light") {
  document.body.classList.add("light");
}

// Video cards
function createVideoCard(video) {
  const card = document.createElement("article");
  card.className = "video-card";

  const img = document.createElement("img");
  img.className = "thumbnail";
  img.src = video.thumbnail;
  img.alt = video.title;

  const title = document.createElement("h3");
  title.textContent = video.title;

  const channel = document.createElement("p");
  channel.textContent = video.channel;

  const stats = document.createElement("p");
  stats.textContent =
    video.views.toLocaleString() + " views • " +
    video.likes + " likes";

  const channelButton = document.createElement("button");
  channelButton.textContent = "Visit channel";
  channelButton.onclick = event => {
    event.stopPropagation();
    openChannel(video.channel);
  };

  card.append(img, title, channel, stats, channelButton);

  card.onclick = () => playVideo(video);

  return card;
}

function displayVideos(list) {
  const grid = $("videoGrid");
  grid.replaceChildren();

  if (!list.length) {
    grid.textContent = "No videos found.";
    return;
  }

  list.forEach(video => grid.appendChild(createVideoCard(video)));
}

// Search
function searchVideos() {
  const query = $("searchInput").value.toLowerCase().trim();

  const results = videos.filter(video =>
    video.title.toLowerCase().includes(query) ||
    video.channel.toLowerCase().includes(query) ||
    video.description.toLowerCase().includes(query)
  );

  showPage("home");
  displayVideos(results);
}

$("searchInput").addEventListener("keydown", event => {
  if (event.key === "Enter") searchVideos();
});

// Categories
function filterVideos(category) {
  currentFilter = category;

  showPage("home");

  const filtered = category === "all"
    ? videos
    : videos.filter(video => video.category === category);

  displayVideos(filtered);
}

// Video player
function playVideo(video) {
  currentVideo = video;

  video.views++;

  historyVideos = [
    video.id,
    ...historyVideos.filter(id => id !== video.id)
  ];

  saveData();

  $("videoPlayer").src = video.url;
  $("watchTitle").textContent = video.title;
  $("watchChannel").textContent = video.channel;
  $("watchDescription").textContent =
    video.description || "No description provided.";

  $("watchViews").textContent =
    video.views.toLocaleString() + " views";

  $("likeCount").textContent = video.likes;
  $("dislikeCount").textContent = video.dislikes;

  $("watchAvatar").textContent =
    video.channel.charAt(0).toUpperCase();

  $("watchSubscribers").textContent =
    getSubscriberCount(video.channel) + " subscribers";

  updateSubscribeButton();
  displayComments();
  displayRecommendations();

  showPage("watch");
}

function closePlayer() {
  $("videoPlayer").pause();
  $("videoPlayer").src = "";
  currentVideo = null;
}

// Likes and dislikes
function likeVideo() {
  if (!currentVideo) return;

  if (likedVideos.includes(currentVideo.id)) {
    likedVideos = likedVideos.filter(id => id !== currentVideo.id);
    currentVideo.likes = Math.max(0, currentVideo.likes - 1);
  } else {
    likedVideos.push(currentVideo.id);
    currentVideo.likes++;

    currentVideo.dislikes = Math.max(
      0,
      currentVideo.dislikes - 1
    );
  }

  saveData();
  updatePlayerCounts();
}

function dislikeVideo() {
  if (!currentVideo) return;

  const wasLiked = likedVideos.includes(currentVideo.id);

  if (wasLiked) {
    likedVideos = likedVideos.filter(id => id !== currentVideo.id);
    currentVideo.likes = Math.max(0, currentVideo.likes - 1);
  }

  currentVideo.dislikes++;
  saveData();
  updatePlayerCounts();
}

function updatePlayerCounts() {
  $("likeCount").textContent = currentVideo.likes;
  $("dislikeCount").textContent = currentVideo.dislikes;
}

// Comments
function displayComments() {
  const list = $("commentList");
  list.replaceChildren();

  if (!currentVideo) return;

  currentVideo.comments ||= [];

  currentVideo.comments.forEach(comment => {
    const item = document.createElement("div");
    item.className = "comment";

    const author = document.createElement("strong");
    author.textContent = comment.author;

    const message = document.createElement("p");
    message.textContent = comment.text;

    const date = document.createElement("small");
    date.textContent = comment.date;

    item.append(author, message, date);
    list.appendChild(item);
  });
}

function addComment() {
  if (!currentVideo) return;

  const input = $("commentInput");
  const text = input.value.trim();

  if (!text) return;

  currentVideo.comments ||= [];

  currentVideo.comments.push({
    author: profileName,
    text,
    date: new Date().toLocaleDateString()
  });

  input.value = "";

  saveData();
  displayComments();
}

// Subscriptions
function getSubscriberCount(channel) {
  return subscribedChannels.filter(name => name === channel).length;
}

function toggleSubscribe() {
  if (!currentChannel && currentVideo) {
    currentChannel = currentVideo.channel;
  }

  if (!currentChannel) return;

  if (subscribedChannels.includes(currentChannel)) {
    subscribedChannels = subscribedChannels.filter(
      name => name !== currentChannel
    );

    addNotification("Unsubscribed from " + currentChannel);
  } else {
    subscribedChannels.push(currentChannel);
    addNotification("Subscribed to " + currentChannel);
  }

  saveData();
  updateSubscribeButton();
  displayProfile();
}

function updateSubscribeButton() {
  if (!currentChannel && currentVideo) {
    currentChannel = currentVideo.channel;
  }

  const subscribed = subscribedChannels.includes(currentChannel);

  $("subscribeButton").textContent =
    subscribed ? "Unsubscribe" : "Subscribe";

  $("watchSubscribe").textContent =
    subscribed ? "Unsubscribe" : "Subscribe";
}

function displaySubscriptions() {
  const grid = $("subscriptionsGrid");
  grid.replaceChildren();

  const results = videos.filter(video =>
    subscribedChannels.includes(video.channel)
  );

  if (!results.length) {
    grid.textContent = "Subscribe to channels to see their videos here.";
    return;
  }

  results.forEach(video => grid.appendChild(createVideoCard(video)));
}

// Channel pages
function openChannel(channel) {
  currentChannel = channel;

  $("channelName").textContent = channel;
  $("channelAvatar").textContent = channel.charAt(0).toUpperCase();

  $("channelStats").textContent =
    getSubscriberCount(channel) + " subscribers";

  $("subscribeButton").textContent =
    subscribedChannels.includes(channel)
      ? "Unsubscribe"
      : "Subscribe";

  const grid = $("channelVideos");
  grid.replaceChildren();

  videos.filter(video => video.channel === channel)
    .forEach(video => grid.appendChild(createVideoCard(video)));

  showPage("channel");
}

// Profile
function displayProfile() {
  $("profileName").textContent = profileName;
  $("profileAvatar").textContent =
    profileName.charAt(0).toUpperCase();

  $("profileStats").textContent =
    getSubscriberCount(profileName) + " subscribers";

  const grid = $("profileVideos");
  grid.replaceChildren();

  videos.filter(video => video.channel === profileName)
    .forEach(video => grid.appendChild(createVideoCard(video)));
}

function editProfile() {
  const name = prompt("Enter your new channel name:", profileName);

  if (!name || !name.trim()) return;

  profileName = name.trim();
  saveData();
  displayProfile();
}

// Recommendations
function displayRecommendations() {
  const container = $("recommendations");
  container.replaceChildren();

  videos.filter(video => currentVideo && video.id !== currentVideo.id)
    .slice(0, 8)
    .forEach(video => {
      const item = document.createElement("div");
      item.className = "recommendation";

      const img = document.createElement("img");
      img.src = video.thumbnail;

      const details = document.createElement("div");
      const title = document.createElement("h4");
      title.textContent = video.title;

      const channel = document.createElement("p");
      channel.textContent = video.channel;

      details.append(title, channel);
      item.append(img, details);

      item.onclick = () => playVideo(video);

      container.appendChild(item);
    });
}

// Watch history
function displayHistory() {
  const grid = $("historyGrid");
  grid.replaceChildren();

  historyVideos.forEach(id => {
    const video = videos.find(video => video.id === id);
    if (video) grid.appendChild(createVideoCard(video));
  });

  if (!historyVideos.length) {
    grid.textContent = "No watch history yet.";
  }
}

function clearHistory() {
  if (!confirm("Clear your watch history?")) return;

  historyVideos = [];
  saveData();
  displayHistory();
}

// Liked videos
function displayLiked() {
  const grid = $("likedGrid");
  grid.replaceChildren();

  likedVideos.forEach(id => {
    const video = videos.find(video => video.id === id);
    if (video) grid.appendChild(createVideoCard(video));
  });

  if (!likedVideos.length) {
    grid.textContent = "You haven't liked any videos yet.";
  }
}

// Trending
function displayTrending() {
  const grid = $("trendingGrid");
  grid.replaceChildren();

  [...videos]
    .sort((a, b) => b.views - a.views)
    .forEach(video => grid.appendChild(createVideoCard(video)));
}

// Shorts
function displayShorts() {
  const grid = $("shortsGrid");
  grid.replaceChildren();

  videos.filter(video => video.isShort).forEach(video => {
    const card = document.createElement("div");
    card.className = "short-card";

    const img = document.createElement("img");
    img.src = video.thumbnail;

    const title = document.createElement("h3");
    title.textContent = video.title;

    card.append(img, title);
    card.onclick = () => playVideo(video);

    grid.appendChild(card);
  });

  if (!grid.children.length) {
    grid.textContent = "No Shorts uploaded yet. Upload a video as a Short!";
  }
}

// Upload video and custom thumbnail
function uploadVideo() {
  const title = $("uploadTitle").value.trim();
  const description = $("uploadDescription").value.trim();
  const category = $("uploadCategory").value;
  const videoFile = $("videoFile").files[0];
  const thumbnailFile = $("thumbnailFile").files[0];
  const isShort = $("isShort").checked;

  if (!title || !videoFile) {
    alert("Please enter a title and select a video.");
    return;
  }

  if (!videoFile.type.startsWith("video/")) {
    alert("Please select a valid video file.");
    return;
  }

  if (thumbnailFile && !thumbnailFile.type.startsWith("image/")) {
    alert("Please select a valid image thumbnail.");
    return;
  }

  const newVideo = {
    id: Date.now(),
    title,
    channel: profileName,
    category,
    description,
    thumbnail: thumbnailFile
      ? URL.createObjectURL(thumbnailFile)
      : "https://picsum.photos/500/280?random=50",
    url: URL.createObjectURL(videoFile),
    likes: 0,
    dislikes: 0,
    views: 0,
    isShort,
    comments: []
  };

  videos.unshift(newVideo);

  addNotification("Your video was uploaded: " + title);

  $("uploadTitle").value = "";
  $("uploadDescription").value = "";
  $("videoFile").value = "";
  $("thumbnailFile").value = "";
  $("isShort").checked = false;

  saveData();
  alert("Video added successfully!");

  showPage(isShort ? "shorts" : "home");
}

// Playlists
function createPlaylist() {
  const input = $("playlistName");
  const name = input.value.trim();

  if (!name) {
    alert("Enter a playlist name.");
    return;
  }

  playlists.push({
    name,
    videoIds: []
  });

  input.value = "";
  saveData();
  displayPlaylists();
}

function displayPlaylists() {
  const grid = $("playlistGrid");
  grid.replaceChildren();

  playlists.forEach((playlist, index) => {
    const card = document.createElement("div");
    card.className = "playlist-card";

    const title = document.createElement("h3");
    title.textContent = "📁 " + playlist.name;

    const count = document.createElement("p");
    count.textContent = playlist.videoIds.length + " videos";

    const open = document.createElement("button");
    open.textContent = "Open playlist";
    open.onclick = () => openPlaylist(index);

    const add = document.createElement("button");
    add.textContent = "Add current video";
    add.onclick = () => {
      if (!currentVideo) {
        alert("Play a video first.");
        return;
      }

      if (!playlist.videoIds.includes(currentVideo.id)) {
        playlist.videoIds.push(currentVideo.id);
        saveData();
        displayPlaylists();
      }
    };

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.onclick = () => {
      playlists.splice(index, 1);
      saveData();
      displayPlaylists();
    };

    card.append(title, count, open, add, remove);
    grid.appendChild(card);
  });

  if (!playlists.length) {
    grid.textContent = "Create your first playlist!";
  }
}

function openPlaylist(index) {
  const playlist = playlists[index];
  const grid = $("playlistGrid");

  grid.replaceChildren();

  const heading = document.createElement("h2");
  heading.textContent = playlist.name;
  grid.appendChild(heading);

  playlist.videoIds.forEach(id => {
    const video = videos.find(video => video.id === id);
    if (video) grid.appendChild(createVideoCard(video));
  });

  const back = document.createElement("button");
  back.textContent = "Back to playlists";
  back.onclick = displayPlaylists;
  grid.appendChild(back);
}

// Notifications
function addNotification(message) {
  notifications.unshift({
    message,
    date: new Date().toLocaleString()
  });

  saveData();
}

function displayNotifications() {
  const list = $("notificationList");
  list.replaceChildren();

  notifications.forEach(notification => {
    const card = document.createElement("div");
    card.className = "notification-card";

    const message = document.createElement("p");
    message.textContent = "🔔 " + notification.message;

    const date = document.createElement("small");
    date.textContent = notification.date;

    card.append(message, date);
    list.appendChild(card);
  });

  if (!notifications.length) {
    list.textContent = "No notifications yet.";
  }
}

// Start app
displayVideos(videos);
displayProfile();
