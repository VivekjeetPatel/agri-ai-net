import mockData from '../../data/communityData.json';

const wait = (ms = 220) => new Promise(resolve => window.setTimeout(resolve, ms));

export async function getPosts() {
  await wait(260);
  return structuredClone(mockData.posts).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getFarmers() {
  await wait(180);
  return structuredClone(mockData.farmers);
}

export async function connect(id) {
  await wait(180);
  return { id, status: 'pending' };
}

export async function likePost(id) {
  await wait(100);
  return { id, success: true };
}

export async function createPost(post) {
  await wait(120);
  return { ...post, id: `local-${Date.now()}`, createdAt: new Date().toISOString(), likes: 0, comments: [] };
}

export const communityData = mockData;
