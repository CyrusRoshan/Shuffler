import Reddit from '../secrets/Reddit'; // NOTE: this is gitignored for obvious reasons

const BASE_URL = 'https://oauth.reddit.com';

export default {
  user: function(username: string) {
    const path = BASE_URL + `/user/${username}`
    return {
      // comments
    }
  }
};

