export type PostType = 'image' | 'video'
export interface PostData {
  url: string,
  dataURL: string,
  author: string,
  title: string,
  subreddit: string,
  id: string,
  prefixed_id: string,
  permalink: string,
  created_utc: number,
  type: PostType,
}

export const ParsePost = (data: any): PostData | undefined => {
  // Verify bare minimum data
  if (
    !data.url ||
    !data.author ||
    !data.title ||
    !data.subreddit ||
    !data.id ||
    !data.name ||
    !data.permalink ||
    !data.created_utc
  ) {
    return undefined;
  }
  data.prefixed_id = data.name;

  // Assign type
  var type: PostType | undefined;
  if (data.post_hint === 'image') {
    data.dataURL = data.url;
    type = 'image';
  }
  else if (
    String(data.url).endsWith(".jpg") ||
    String(data.url).endsWith(".png") ||
    String(data.url).endsWith(".jpeg")
  ) {
    data.dataURL = data.url;
    type = 'image';
  }
  else if (
    data.secure_media &&
    data.secure_media.reddit_video &&
    data.secure_media.reddit_video.fallback_url
  ) {
    data.dataURL = data.secure_media.reddit_video.fallback_url;
    type = 'video';
  }
  else if (data.post_hint === 'hosted:video') {
    data.dataURL = data.url;
    type = 'video';
  }
  else if (
    data.preview &&
    data.preview.reddit_video_preview &&
    data.preview.reddit_video_preview.fallback_url
  ) {
    data.dataURL = data.preview.reddit_video_preview.fallback_url;
    type = 'video';
  }

  // Check type was assigned
  if (!type) {
    return undefined;
  }
  data.type = type;

  return data as PostData;
}