export const isVideoUrl = (url?: string | null): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.mkv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
};
