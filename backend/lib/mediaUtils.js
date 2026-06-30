const VIDEO_EXT = /\.(mp4|mov|webm|avi|mkv|m4v|ogg)(\?|$)/i;

export const isVideoMedia = (urlOrFile) => {
  if (urlOrFile?.mimetype) {
    return urlOrFile.mimetype.startsWith('video/');
  }
  return typeof urlOrFile === 'string' && VIDEO_EXT.test(urlOrFile);
};

export const mediaFromFile = (file) => ({
  url: file?.location || null,
  type: isVideoMedia(file) ? 'VIDEO' : 'IMAGE',
});

export const mediaFromUrl = (url) => ({
  url,
  type: isVideoMedia(url) ? 'VIDEO' : 'IMAGE',
});

export const isVideoItem = (item) =>
  item?.type === 'VIDEO' || isVideoMedia(item?.url);

/** Videos first, then images (newest first within each group). */
export const sortMediaVideosFirst = (items = []) =>
  [...items].sort((a, b) => {
    const aVideo = isVideoItem(a) ? 0 : 1;
    const bVideo = isVideoItem(b) ? 0 : 1;
    if (aVideo !== bVideo) return aVideo - bVideo;
    return (b.id ?? 0) - (a.id ?? 0);
  });

export const sortMediaPayloadVideosFirst = (items = []) =>
  [...items].sort((a, b) => {
    const aVideo = a.type === 'VIDEO' ? 0 : 1;
    const bVideo = b.type === 'VIDEO' ? 0 : 1;
    return aVideo - bVideo;
  });
